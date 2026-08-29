use serde::{Deserialize, Serialize};
use std::{
    ffi::OsString,
    fs::{create_dir_all, File, OpenOptions},
    io::{Read, Write},
    net::{SocketAddr, TcpStream},
    path::{Path, PathBuf},
    process::{Child, Command, Stdio},
    str::FromStr,
    sync::Mutex,
    thread,
    time::{Duration, SystemTime, UNIX_EPOCH},
};
use tauri::{
    menu::{Menu, MenuItem},
    tray::TrayIconBuilder,
    AppHandle, Manager, State, WebviewUrl, WebviewWindowBuilder,
};

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
struct LauncherConfig {
    project_dir: String,
    pnpm_path: String,
    log_dir: String,
    port: u16,
    skin_id: String,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
struct ServiceStatus {
    phase: String,
    pid: Option<u32>,
    url: String,
    message: String,
    owned: bool,
    log_path: String,
    started_at: Option<u64>,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
struct EnvironmentInfo {
    project_dir: String,
    pnpm_path: String,
    dsh_version: Option<String>,
    node_version: Option<String>,
    native: bool,
}

struct ManagedService {
    child: Option<Child>,
    port: u16,
    started_at: Option<u64>,
    log_path: PathBuf,
}

impl Default for ManagedService {
    fn default() -> Self {
        Self {
            child: None,
            port: 3080,
            started_at: None,
            log_path: expand_home("~/Library/Logs/DSH WhaleConsole").join("dsh-whale-console.log"),
        }
    }
}

fn is_port_open(port: u16) -> bool {
    let address = SocketAddr::from_str(&format!("127.0.0.1:{port}"));
    address
        .ok()
        .and_then(|address| TcpStream::connect_timeout(&address, Duration::from_millis(180)).ok())
        .is_some()
}

fn now_ms() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_millis() as u64
}

fn expand_home(path: &str) -> PathBuf {
    if path == "~" {
        return std::env::var("HOME")
            .map(PathBuf::from)
            .unwrap_or_else(|_| PathBuf::from(path));
    }
    if let Some(rest) = path.strip_prefix("~/") {
        if let Ok(home) = std::env::var("HOME") {
            return PathBuf::from(home).join(rest);
        }
    }
    PathBuf::from(path)
}

fn resolve_executable(command: &str) -> Option<PathBuf> {
    if command.contains('/') {
        let path = expand_home(command);
        return path.is_file().then_some(path);
    }

    Command::new("/bin/zsh")
        .args(["-lc", "command -v -- \"$0\"", command])
        .output()
        .ok()
        .filter(|result| result.status.success())
        .and_then(|result| {
            let path = String::from_utf8_lossy(&result.stdout).trim().to_string();
            (!path.is_empty()).then(|| PathBuf::from(path))
        })
}

fn login_shell_path() -> Option<OsString> {
    Command::new("/bin/zsh")
        .args(["-lc", "printf '%s' \"$PATH\""])
        .output()
        .ok()
        .filter(|result| result.status.success())
        .and_then(|result| {
            let path = String::from_utf8_lossy(&result.stdout).trim().to_string();
            (!path.is_empty()).then(|| OsString::from(path))
        })
}

fn runtime_path(pnpm: &Path) -> OsString {
    let mut directories = Vec::<PathBuf>::new();
    let mut push_unique = |path: &Path| {
        let path = path.to_path_buf();
        if !directories.contains(&path) {
            directories.push(path);
        }
    };

    if let Some(parent) = pnpm.parent() {
        push_unique(parent);
    }
    if let Some(node) = resolve_executable("node") {
        if let Some(parent) = node.parent() {
            push_unique(parent);
        }
    }
    if let Some(shell_path) = login_shell_path() {
        for directory in std::env::split_paths(&shell_path) {
            push_unique(&directory);
        }
    }
    if let Some(current_path) = std::env::var_os("PATH") {
        for directory in std::env::split_paths(&current_path) {
            push_unique(&directory);
        }
    }

    std::env::join_paths(directories)
        .unwrap_or_else(|_| std::env::var_os("PATH").unwrap_or_default())
}

fn configured_log_path(config: &LauncherConfig) -> Result<PathBuf, String> {
    let raw = config.log_dir.trim();
    if raw.is_empty() {
        return Err("日志目录不能为空".into());
    }
    let directory = expand_home(raw);
    if !directory.is_absolute() {
        return Err("日志目录必须是绝对路径或以 ~/ 开头".into());
    }
    Ok(directory.join("dsh-whale-console.log"))
}

fn make_status(service: &mut ManagedService, port: u16) -> ServiceStatus {
    let url = format!("http://127.0.0.1:{port}");
    let log_path = service.log_path.to_string_lossy().to_string();
    let mut owned = false;
    let mut pid = None;
    let mut child_alive = false;

    if let Some(child) = service.child.as_mut() {
        match child.try_wait() {
            Ok(None) => {
                child_alive = true;
                owned = true;
                pid = Some(child.id());
            }
            Ok(Some(_)) | Err(_) => {
                service.child = None;
                service.started_at = None;
            }
        }
    }

    if is_port_open(port) {
        return ServiceStatus {
            phase: if owned { "ready" } else { "external" }.into(),
            pid,
            url,
            message: if owned {
                "服务已就绪"
            } else {
                "检测到由其他进程启动的 DSH 服务"
            }
            .into(),
            owned,
            log_path,
            started_at: service.started_at,
        };
    }

    if child_alive {
        ServiceStatus {
            phase: "starting".into(),
            pid,
            url,
            message: "正在等待 WebUI 端口就绪…".into(),
            owned,
            log_path,
            started_at: service.started_at,
        }
    } else {
        ServiceStatus {
            phase: "stopped".into(),
            pid: None,
            url,
            message: "服务尚未启动".into(),
            owned: false,
            log_path,
            started_at: None,
        }
    }
}

#[tauri::command]
fn get_status(
    config: LauncherConfig,
    state: State<'_, Mutex<ManagedService>>,
) -> Result<ServiceStatus, String> {
    let mut service = state.lock().map_err(|_| "service state is unavailable")?;
    if service.child.is_none() {
        service.log_path = configured_log_path(&config)?;
    }
    Ok(make_status(&mut service, config.port))
}

#[tauri::command]
fn start_service(
    config: LauncherConfig,
    state: State<'_, Mutex<ManagedService>>,
) -> Result<ServiceStatus, String> {
    let mut service = state.lock().map_err(|_| "service state is unavailable")?;
    let current = make_status(&mut service, config.port);
    if current.phase == "ready" || current.phase == "starting" || current.phase == "external" {
        return Ok(current);
    }

    let project_dir = expand_home(&config.project_dir);
    if !project_dir.is_dir() {
        return Err(format!("找不到 DSH 项目目录：{}", config.project_dir));
    }
    let pnpm = resolve_executable(&config.pnpm_path)
        .ok_or_else(|| format!("找不到 pnpm：{}", config.pnpm_path))?;
    let log_path = configured_log_path(&config)?;
    let log_directory = log_path
        .parent()
        .ok_or_else(|| "日志目录无效".to_string())?;
    create_dir_all(log_directory).map_err(|error| {
        format!(
            "无法创建日志目录 {}：{error}",
            log_directory.to_string_lossy()
        )
    })?;

    service.port = config.port;
    service.log_path = log_path;
    let mut log = File::create(&service.log_path).map_err(|error| {
        format!(
            "无法创建日志文件 {}：{error}",
            service.log_path.to_string_lossy()
        )
    })?;
    writeln!(
        log,
        "[WhaleConsole] starting DSH from {} with {} on port {}",
        project_dir.to_string_lossy(),
        pnpm.to_string_lossy(),
        config.port
    )
    .map_err(|error| format!("无法写入日志：{error}"))?;
    let stderr = log
        .try_clone()
        .map_err(|error| format!("无法打开日志：{error}"))?;
    let path = runtime_path(&pnpm);
    let mut command = Command::new(&pnpm);
    command
        .current_dir(&project_dir)
        .args([
            "dsh",
            "web",
            "--no-open",
            "--port",
            &config.port.to_string(),
        ])
        .env("DSH_WHALE_SKIN", &config.skin_id)
        .env("PATH", path)
        .env("CHOKIDAR_USEPOLLING", "true")
        .env("WATCHPACK_POLLING", "true")
        .stdin(Stdio::null())
        .stdout(Stdio::from(log))
        .stderr(Stdio::from(stderr));

    #[cfg(unix)]
    {
        use std::os::unix::process::CommandExt;
        command.process_group(0);
    }

    let child = command
        .spawn()
        .map_err(|error| format!("无法启动 DSH：{error}"))?;
    service.started_at = Some(now_ms());
    service.child = Some(child);
    Ok(make_status(&mut service, config.port))
}

fn terminate_service(service: &mut ManagedService) -> Result<(), String> {
    let Some(mut child) = service.child.take() else {
        return Ok(());
    };

    #[cfg(unix)]
    unsafe {
        libc::kill(-(child.id() as i32), libc::SIGTERM);
    }

    for _ in 0..20 {
        if child
            .try_wait()
            .map_err(|error| error.to_string())?
            .is_some()
        {
            service.started_at = None;
            return Ok(());
        }
        thread::sleep(Duration::from_millis(100));
    }

    #[cfg(unix)]
    unsafe {
        libc::kill(-(child.id() as i32), libc::SIGKILL);
    }
    let _ = child.wait();
    service.started_at = None;
    Ok(())
}

#[tauri::command]
fn stop_service(state: State<'_, Mutex<ManagedService>>) -> Result<ServiceStatus, String> {
    let mut service = state.lock().map_err(|_| "service state is unavailable")?;
    let port = service.port;
    terminate_service(&mut service)?;
    Ok(make_status(&mut service, port))
}

#[tauri::command]
fn restart_service(
    config: LauncherConfig,
    state: State<'_, Mutex<ManagedService>>,
) -> Result<ServiceStatus, String> {
    {
        let mut service = state.lock().map_err(|_| "service state is unavailable")?;
        terminate_service(&mut service)?;
    }
    start_service(config, state)
}

#[tauri::command]
fn read_logs(state: State<'_, Mutex<ManagedService>>) -> Result<String, String> {
    let service = state.lock().map_err(|_| "service state is unavailable")?;
    let mut file = OpenOptions::new()
        .read(true)
        .open(&service.log_path)
        .map_err(|error| {
            format!(
                "无法读取日志文件 {}：{error}",
                service.log_path.to_string_lossy()
            )
        })?;
    let mut text = String::new();
    file.read_to_string(&mut text)
        .map_err(|error| error.to_string())?;
    let mut start = text.len().saturating_sub(120_000);
    while !text.is_char_boundary(start) {
        start += 1;
    }
    Ok(text[start..].to_string())
}

#[tauri::command]
fn get_environment() -> EnvironmentInfo {
    fn output(command_name: &str, args: &[&str], cwd: Option<&std::path::Path>) -> Option<String> {
        let mut command = Command::new(command_name);
        command.args(args);
        command.env("PATH", runtime_path(Path::new(command_name)));
        if let Some(cwd) = cwd {
            command.current_dir(cwd);
        }
        command
            .output()
            .ok()
            .filter(|result| result.status.success())
            .map(|result| String::from_utf8_lossy(&result.stdout).trim().to_string())
    }
    let home = std::env::var("HOME").unwrap_or_default();
    let project_dir = std::env::var("DSH_PROJECT_DIR").unwrap_or_else(|_| {
        PathBuf::from(&home)
            .join("deepseek-harness")
            .to_string_lossy()
            .to_string()
    });
    let pnpm_path = resolve_executable("pnpm")
        .map(|path| path.to_string_lossy().to_string())
        .unwrap_or_else(|| "pnpm".into());
    let node_version = output("/bin/zsh", &["-lc", "node --version"], None);
    let dsh_version = output(
        &pnpm_path,
        &["dsh", "--version"],
        Some(std::path::Path::new(&project_dir)),
    );
    EnvironmentInfo {
        project_dir,
        pnpm_path,
        dsh_version,
        node_version,
        native: true,
    }
}

#[tauri::command]
fn open_webui(app: AppHandle, url: String) -> Result<(), String> {
    if let Some(window) = app.get_webview_window("webui") {
        window.show().map_err(|error| error.to_string())?;
        window.set_focus().map_err(|error| error.to_string())?;
        return Ok(());
    }
    let external = url
        .parse()
        .map_err(|error| format!("无效的 WebUI 地址：{error}"))?;
    WebviewWindowBuilder::new(&app, "webui", WebviewUrl::External(external))
        .title("DSH WebUI")
        .inner_size(1400.0, 900.0)
        .min_inner_size(900.0, 620.0)
        .center()
        .build()
        .map_err(|error| error.to_string())?;
    Ok(())
}

pub fn run() {
    let app = tauri::Builder::default()
        .manage(Mutex::new(ManagedService::default()))
        .setup(|app| {
            let show = MenuItem::with_id(app, "show", "显示 DSH 鲸控台", true, None::<&str>)?;
            let quit = MenuItem::with_id(app, "quit", "退出", true, None::<&str>)?;
            let menu = Menu::with_items(app, &[&show, &quit])?;
            let mut tray = TrayIconBuilder::new()
                .menu(&menu)
                .show_menu_on_left_click(false);
            if let Some(icon) = app.default_window_icon() {
                tray = tray.icon(icon.clone());
            }
            tray.on_menu_event(|app, event| match event.id.as_ref() {
                "show" => {
                    if let Some(window) = app.get_webview_window("main") {
                        let _ = window.show();
                        let _ = window.set_focus();
                    }
                }
                "quit" => app.exit(0),
                _ => {}
            })
            .build(app)?;
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            get_environment,
            get_status,
            start_service,
            stop_service,
            restart_service,
            read_logs,
            open_webui,
        ])
        .build(tauri::generate_context!())
        .expect("error while building DSH WhaleConsole");

    app.run(|app_handle, event| {
        if let tauri::RunEvent::Exit = event {
            if let Ok(mut service) = app_handle.state::<Mutex<ManagedService>>().lock() {
                let _ = terminate_service(&mut service);
            }
        }
    });
}
