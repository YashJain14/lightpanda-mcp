# Lightpanda MCP Server

MCP (Model Context Protocol) server wrapper for [Lightpanda](https://lightpanda.io) browser automation.

## Features

- **Auto-installation**: Downloads the Lightpanda binary automatically on first use
- **Platform support**: macOS (arm64/x86_64), Linux (arm64/x86_64)
- **Zero configuration**: Works out of the box with MCP clients
- **11 browser automation tools**: Navigation, content extraction, interaction, and more

## Installation

### For Jan Users

Enable "Lightpanda Browser" in Jan Settings → MCP Servers. Jan will automatically install this package via npx.

### Manual Installation

```bash
npx lightpanda-mcp
```

The first run will download the Lightpanda binary (~60-110MB depending on platform).

## Available Tools

Lightpanda provides 11 MCP tools for browser automation:

### Navigation & Content
- `goto` - Navigate to URLs
- `markdown` - Extract page content in markdown format
- `links` - Extract all links from page
- `evaluate` - Execute JavaScript on page

### Page Understanding
- `semantic_tree` - Get simplified DOM tree optimized for AI reasoning
- `interactiveElements` - List all clickable elements with backend IDs
- `structuredData` - Extract JSON-LD, OpenGraph, and meta tags

### Interaction
- `click` - Click elements by backend ID
- `fill` - Fill form inputs
- `scroll` - Scroll page or specific elements
- `waitForSelector` - Wait for elements to appear

## Usage

### With MCP Client

Configure your MCP client to use:

```json
{
  "mcpServers": {
    "lightpanda": {
      "command": "npx",
      "args": ["-y", "lightpanda-mcp"]
    }
  }
}
```

### Direct Usage (Testing)

```bash
# Start the MCP server
npx lightpanda-mcp

# In another terminal, send MCP commands via stdin
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | npx lightpanda-mcp
```

## Platform Support

| Platform | Architecture | Binary Size | Status |
|----------|-------------|-------------|---------|
| macOS | ARM64 (Apple Silicon) | ~59MB | ✅ Supported |
| macOS | x86_64 (Intel) | ~62MB | ✅ Supported |
| Linux | ARM64 | ~113MB | ✅ Supported |
| Linux | x86_64 | ~108MB | ✅ Supported |
| Windows | - | - | ⚠️ Use WSL2 |

## Requirements

- Node.js >= 18.0.0
- Internet connection for initial binary download

## How It Works

1. On first run, detects your platform (OS + architecture)
2. Downloads the appropriate Lightpanda binary from [GitHub releases](https://github.com/lightpanda-io/browser/releases)
3. Saves binary to `./bin/lightpanda` in the package directory
4. Starts `lightpanda mcp` and proxies stdin/stdout to your MCP client
5. Subsequent runs use the cached binary

## Troubleshooting

### Download fails

If the download fails, you can manually install Lightpanda:

```bash
# macOS (arm64)
curl -L -o lightpanda https://github.com/lightpanda-io/browser/releases/download/nightly/lightpanda-aarch64-macos
chmod +x lightpanda
mv lightpanda /usr/local/bin/

# Then use native lightpanda instead
lightpanda mcp
```

### Binary not found after installation

The binary is stored in `node_modules/lightpanda-mcp/bin/lightpanda`. If npx can't find it, try:

```bash
npm install -g lightpanda-mcp
lightpanda-mcp
```

## About Lightpanda

Lightpanda is a lightweight headless browser built in Zig, designed for:
- 11x faster than Chrome
- 9x less memory usage
- Native MCP support
- Built-in browser automation tools

Learn more at [lightpanda.io](https://lightpanda.io)

## License

MIT

## Contributing

Issues and PRs welcome at [github.com/YashJain14/lightpanda-mcp](https://github.com/YashJain14/lightpanda-mcp)