#!/usr/bin/env swift

import AppKit
import Foundation

private let canvasSize = NSSize(width: 1280, height: 720)
private let root = URL(fileURLWithPath: FileManager.default.currentDirectoryPath)
private let sourceDirectory = root.appendingPathComponent("packages/skins/assets/thumbnails/source")
private let runtimeDirectory = root.appendingPathComponent("packages/skins/assets/thumbnails")

private struct SkinPreview {
    let id: String
    let title: String
    let kicker: String
    let accent: String
    let background: String
    let panel: String
    let panelStrong: String
    let text: String
    let muted: String
    let characterPath: String
    let secondaryCharacterPath: String?
}

private let previews = [
    SkinPreview(
        id: "harness-standard",
        title: "鲸链工程师",
        kicker: "WHALE ENGINEER",
        accent: "#58D8FF",
        background: "#101318",
        panel: "#151922",
        panelStrong: "#202735",
        text: "#F4F7FB",
        muted: "#8994A5",
        characterPath: "apps/launcher/public/assets/harness-engineer.webp",
        secondaryCharacterPath: nil
    ),
    SkinPreview(
        id: "harness-medium",
        title: "中号鲸链工程师",
        kicker: "MEDIUM WHALE ENGINEER",
        accent: "#4D6BFE",
        background: "#101318",
        panel: "#151922",
        panelStrong: "#20273A",
        text: "#F4F7FB",
        muted: "#8994A5",
        characterPath: "assets/skins/harness-engineer/harness-engineer-medium-delogo-v1.png",
        secondaryCharacterPath: nil
    ),
    SkinPreview(
        id: "harness-chibi",
        title: "Q版鲸链工程师",
        kicker: "CHIBI WHALE ENGINEER",
        accent: "#38D8FF",
        background: "#0B111A",
        panel: "#131A24",
        panelStrong: "#1D2B3A",
        text: "#F4F9FF",
        muted: "#8394A8",
        characterPath: "assets/skins/harness-engineer/harness-engineer-chibi-keyart-v2.png",
        secondaryCharacterPath: nil
    ),
    SkinPreview(
        id: "maid-standard",
        title: "深海女仆",
        kicker: "DEEP SEA MAID",
        accent: "#4F7FE8",
        background: "#EDF5FF",
        panel: "#F8FBFF",
        panelStrong: "#E6EEFA",
        text: "#17213A",
        muted: "#6C7993",
        characterPath: "apps/launcher/public/assets/deepsea-maid.webp",
        secondaryCharacterPath: nil
    ),
    SkinPreview(
        id: "dual-standard",
        title: "双鲸协作",
        kicker: "DUAL WHALE",
        accent: "#6EDCD5",
        background: "#10171A",
        panel: "#151E22",
        panelStrong: "#203035",
        text: "#F4F8F7",
        muted: "#849693",
        characterPath: "apps/launcher/public/assets/harness-engineer.webp",
        secondaryCharacterPath: "apps/launcher/public/assets/deepsea-maid.webp"
    ),
]

private func color(_ hex: String, alpha: CGFloat = 1) -> NSColor {
    let value = hex.trimmingCharacters(in: CharacterSet(charactersIn: "#"))
    guard value.count == 6, let number = Int(value, radix: 16) else {
        return NSColor.clear
    }
    return NSColor(
        calibratedRed: CGFloat((number >> 16) & 0xFF) / 255,
        green: CGFloat((number >> 8) & 0xFF) / 255,
        blue: CGFloat(number & 0xFF) / 255,
        alpha: alpha
    )
}

private func roundedRect(_ rect: NSRect, radius: CGFloat, fill: NSColor, stroke: NSColor? = nil, width: CGFloat = 1) {
    let path = NSBezierPath(roundedRect: rect, xRadius: radius, yRadius: radius)
    fill.setFill()
    path.fill()
    if let stroke {
        stroke.setStroke()
        path.lineWidth = width
        path.stroke()
    }
}

private func line(from start: NSPoint, to end: NSPoint, color: NSColor, width: CGFloat = 1) {
    let path = NSBezierPath()
    path.move(to: start)
    path.line(to: end)
    path.lineWidth = width
    color.setStroke()
    path.stroke()
}

private func drawText(_ value: String, at point: NSPoint, size: CGFloat, color: NSColor, weight: NSFont.Weight = .regular, monospaced: Bool = false) {
    let font = monospaced
        ? NSFont.monospacedSystemFont(ofSize: size, weight: weight)
        : NSFont.systemFont(ofSize: size, weight: weight)
    (value as NSString).draw(at: point, withAttributes: [
        .font: font,
        .foregroundColor: color,
    ])
}

private func image(at relativePath: String) -> NSImage {
    let path = root.appendingPathComponent(relativePath).path
    guard let image = NSImage(contentsOfFile: path) else {
        fatalError("Unable to load image: \(relativePath)")
    }
    return image
}

private func aspectFit(_ image: NSImage, in bounds: NSRect) -> NSRect {
    let scale = min(bounds.width / image.size.width, bounds.height / image.size.height)
    let size = NSSize(width: image.size.width * scale, height: image.size.height * scale)
    return NSRect(
        x: bounds.midX - size.width / 2,
        y: bounds.midY - size.height / 2,
        width: size.width,
        height: size.height
    )
}

private func drawImage(_ image: NSImage, in bounds: NSRect, fraction: CGFloat = 1) {
    image.draw(
        in: aspectFit(image, in: bounds),
        from: .zero,
        operation: .sourceOver,
        fraction: fraction,
        respectFlipped: true,
        hints: [.interpolation: NSImageInterpolation.high]
    )
}

private final class ThumbnailView: NSView {
    let preview: SkinPreview

    init(preview: SkinPreview) {
        self.preview = preview
        super.init(frame: NSRect(origin: .zero, size: canvasSize))
    }

    required init?(coder: NSCoder) {
        nil
    }

    override var isFlipped: Bool { true }

    override func draw(_ dirtyRect: NSRect) {
        super.draw(dirtyRect)

        let background = color(preview.background)
        let panel = color(preview.panel)
        let strong = color(preview.panelStrong)
        let accent = color(preview.accent)
        let text = color(preview.text)
        let muted = color(preview.muted)

        background.setFill()
        bounds.fill()

        for x in stride(from: CGFloat(0), through: canvasSize.width, by: 52) {
            line(from: NSPoint(x: x, y: 62), to: NSPoint(x: x, y: 678), color: muted.withAlphaComponent(0.13))
        }
        for y in stride(from: CGFloat(62), through: CGFloat(678), by: 52) {
            line(from: NSPoint(x: 0, y: y), to: NSPoint(x: 1280, y: y), color: muted.withAlphaComponent(0.13))
        }

        background.withAlphaComponent(0.96).setFill()
        NSRect(x: 0, y: 0, width: 1280, height: 62).fill()
        NSRect(x: 0, y: 678, width: 1280, height: 42).fill()
        line(from: NSPoint(x: 0, y: 61), to: NSPoint(x: 1280, y: 61), color: muted.withAlphaComponent(0.26))
        line(from: NSPoint(x: 0, y: 678), to: NSPoint(x: 1280, y: 678), color: muted.withAlphaComponent(0.26))

        accent.withAlphaComponent(0.24).setFill()
        NSBezierPath(ovalIn: NSRect(x: 31, y: 22, width: 29, height: 16)).fill()
        accent.setFill()
        NSBezierPath(ovalIn: NSRect(x: 38, y: 20, width: 25, height: 19)).fill()
        drawText("DSH WhaleConsole", at: NSPoint(x: 74, y: 18), size: 18, color: text, weight: .bold)
        drawText("UNOFFICIAL COMMUNITY PREVIEW", at: NSPoint(x: 75, y: 39), size: 7, color: muted, weight: .semibold, monospaced: true)
        accent.setFill()
        NSBezierPath(ovalIn: NSRect(x: 1175, y: 27, width: 7, height: 7)).fill()
        drawText("LOCAL WEBUI", at: NSPoint(x: 1188, y: 25), size: 8, color: muted, weight: .semibold, monospaced: true)

        let characterBounds = NSRect(x: 30, y: 75, width: 370, height: 560)
        drawImage(image(at: preview.characterPath), in: characterBounds)

        if let secondaryPath = preview.secondaryCharacterPath {
            let circle = NSRect(x: 282, y: 112, width: 235, height: 235)
            NSGraphicsContext.saveGraphicsState()
            NSBezierPath(ovalIn: circle).addClip()
            strong.setFill()
            circle.fill()
            drawImage(image(at: secondaryPath), in: circle.insetBy(dx: 8, dy: 8))
            NSGraphicsContext.restoreGraphicsState()
            let outline = NSBezierPath(ovalIn: circle)
            outline.lineWidth = 2
            accent.setStroke()
            outline.stroke()
        }

        accent.setFill()
        NSRect(x: 38, y: 598, width: 54, height: 3).fill()
        drawText(preview.kicker, at: NSPoint(x: 38, y: 608), size: 9, color: accent, weight: .bold, monospaced: true)
        drawText(preview.title, at: NSPoint(x: 38, y: 630), size: 30, color: text, weight: .bold)

        let app = NSRect(x: 430, y: 98, width: 802, height: 550)
        roundedRect(app, radius: 7, fill: panel, stroke: muted.withAlphaComponent(0.32))
        line(from: NSPoint(x: app.minX, y: 147), to: NSPoint(x: app.maxX, y: 147), color: muted.withAlphaComponent(0.3))
        line(from: NSPoint(x: 620, y: 147), to: NSPoint(x: 620, y: app.maxY), color: muted.withAlphaComponent(0.3))

        accent.setFill()
        NSBezierPath(ovalIn: NSRect(x: 449, y: 113, width: 18, height: 18)).fill()
        drawText("DSH Local Build", at: NSPoint(x: 477, y: 113), size: 14, color: text, weight: .semibold)
        roundedRect(NSRect(x: 1164, y: 114, width: 51, height: 17), radius: 3, fill: strong, stroke: muted.withAlphaComponent(0.3))
        drawText("PREVIEW", at: NSPoint(x: 1172, y: 117), size: 7, color: muted, weight: .bold, monospaced: true)

        roundedRect(NSRect(x: 449, y: 165, width: 152, height: 39), radius: 4, fill: strong, stroke: muted.withAlphaComponent(0.28))
        drawText("+", at: NSPoint(x: 475, y: 173), size: 17, color: text, weight: .regular)
        drawText("New Session", at: NSPoint(x: 496, y: 175), size: 13, color: text, weight: .semibold)
        drawText("WORKSPACES", at: NSPoint(x: 449, y: 226), size: 8, color: muted, weight: .bold, monospaced: true)
        for (index, width) in [135, 96, 115].enumerated() {
            roundedRect(NSRect(x: 449, y: 247 + CGFloat(index * 18), width: CGFloat(width), height: 6), radius: 3, fill: muted.withAlphaComponent(0.36))
        }
        roundedRect(NSRect(x: 449, y: 609, width: 19, height: 19), radius: 4, fill: accent.withAlphaComponent(0.18), stroke: accent)
        drawText("WhaleConsole", at: NSPoint(x: 476, y: 609), size: 11, color: muted)

        drawText("INTO THE UNKNOWN", at: NSPoint(x: 649, y: 173), size: 14, color: text, weight: .bold, monospaced: true)
        roundedRect(NSRect(x: 794, y: 173, width: 55, height: 17), radius: 3, fill: strong)
        drawText("Preview", at: NSPoint(x: 801, y: 176), size: 7, color: muted, weight: .semibold, monospaced: true)

        roundedRect(NSRect(x: 649, y: 247, width: 294, height: 86), radius: 6, fill: strong, stroke: muted.withAlphaComponent(0.25))
        accent.setFill()
        NSBezierPath(ovalIn: NSRect(x: 666, y: 264, width: 24, height: 24)).fill()
        roundedRect(NSRect(x: 702, y: 295, width: 199, height: 6), radius: 3, fill: muted.withAlphaComponent(0.35))
        roundedRect(NSRect(x: 702, y: 310, width: 166, height: 6), radius: 3, fill: muted.withAlphaComponent(0.35))

        roundedRect(NSRect(x: 911, y: 357, width: 294, height: 54), radius: 5, fill: accent.withAlphaComponent(0.2))
        roundedRect(NSRect(x: 928, y: 375, width: 234, height: 6), radius: 3, fill: muted.withAlphaComponent(0.34))
        roundedRect(NSRect(x: 928, y: 390, width: 166, height: 6), radius: 3, fill: muted.withAlphaComponent(0.34))

        roundedRect(NSRect(x: 649, y: 560, width: 556, height: 62), radius: 6, fill: panel, stroke: accent.withAlphaComponent(0.75))
        drawText("Choose a workspace to start", at: NSPoint(x: 667, y: 583), size: 11, color: muted)
        accent.setFill()
        NSBezierPath(ovalIn: NSRect(x: 1156, y: 573, width: 34, height: 34)).fill()
        drawText("^", at: NSPoint(x: 1167, y: 579), size: 17, color: background, weight: .bold)

        accent.setFill()
        NSBezierPath(ovalIn: NSRect(x: 21, y: 696, width: 7, height: 7)).fill()
        drawText("SKIN MANIFEST LINKED", at: NSPoint(x: 37, y: 694), size: 7, color: muted, weight: .semibold, monospaced: true)
        drawText(preview.id, at: NSPoint(x: 1180, y: 694), size: 8, color: text, weight: .semibold, monospaced: true)
    }
}

private func render(_ preview: SkinPreview) throws {
    let view = ThumbnailView(preview: preview)
    guard let representation = view.bitmapImageRepForCachingDisplay(in: view.bounds) else {
        fatalError("Unable to create bitmap representation for \(preview.id)")
    }
    view.cacheDisplay(in: view.bounds, to: representation)
    guard let png = representation.representation(using: .png, properties: [:]) else {
        fatalError("Unable to encode PNG for \(preview.id)")
    }

    let pngURL = sourceDirectory.appendingPathComponent("\(preview.id).png")
    try png.write(to: pngURL, options: .atomic)

    let process = Process()
    process.executableURL = URL(fileURLWithPath: "/usr/bin/env")
    process.arguments = [
        "cwebp", "-quiet", "-q", "88", "-metadata", "none",
        pngURL.path, "-o", runtimeDirectory.appendingPathComponent("\(preview.id).webp").path,
    ]
    try process.run()
    process.waitUntilExit()
    guard process.terminationStatus == 0 else {
        fatalError("cwebp failed for \(preview.id)")
    }
    print("Rendered \(preview.id)")
}

try FileManager.default.createDirectory(at: sourceDirectory, withIntermediateDirectories: true)
try FileManager.default.createDirectory(at: runtimeDirectory, withIntermediateDirectories: true)
for preview in previews {
    try render(preview)
}
