// CodePlayground Pro - Professional Online Code Editor
// Enhanced with mobile support and cross-device compatibility

class CodePlaygroundPro {
  constructor() {
    this.editors = {
      html: null,
      css: null,
      js: null,
    }
    this.isOnline = navigator.onLine
    this.consoleMessages = []
    this.currentTheme = localStorage.getItem("theme") || "light"
    this.isMobile = window.innerWidth <= 768
    this.touchStartY = 0
    this.touchStartX = 0

    this.init()
  }

  init() {
    this.setupEditors()
    this.setupEventListeners()
    this.setupTheme()
    this.setupConnectionMonitoring()
    this.setupMobileSupport()
    this.loadFromStorage()
    this.updatePreview()

    console.log("🚀 CodePlayground Pro initialized successfully!")
  }

  setupEditors() {
    this.editors.html = document.getElementById("htmlEditor")
    this.editors.css = document.getElementById("cssEditor")
    this.editors.js = document.getElementById("jsEditor")

    // Add input event listeners for live preview
    Object.values(this.editors).forEach((editor) => {
      if (editor) {
        editor.addEventListener("input", () => {
          this.debounce(this.updatePreview.bind(this), 500)()
          this.saveToStorage()
        })

        editor.addEventListener("focus", (e) => {
          e.target.closest(".editor-wrapper").classList.add("focused")
          if (this.isMobile) {
            // Scroll editor into view on mobile
            setTimeout(() => {
              e.target.scrollIntoView({ behavior: "smooth", block: "center" })
            }, 300)
          }
        })

        editor.addEventListener("blur", (e) => {
          e.target.closest(".editor-wrapper").classList.remove("focused")
        })

        editor.addEventListener("keydown", (e) => {
          if (e.key === "Tab") {
            e.preventDefault()
            const start = e.target.selectionStart
            const end = e.target.selectionEnd
            const value = e.target.value

            e.target.value = value.substring(0, start) + "  " + value.substring(end)
            e.target.selectionStart = e.target.selectionEnd = start + 2
          }
        })
      }
    })
  }

  setupEventListeners() {
    // Button event listeners
    document.getElementById("runBtn")?.addEventListener("click", () => this.runCode())
    document.getElementById("formatBtn")?.addEventListener("click", () => this.formatCode())
    document.getElementById("saveBtn")?.addEventListener("click", () => this.saveCode())
    document.getElementById("downloadBtn")?.addEventListener("click", () => this.downloadCode())
    document.getElementById("clearBtn")?.addEventListener("click", () => this.clearCode())
    document.getElementById("shareBtn")?.addEventListener("click", () => this.showShareModal())
    document.getElementById("templatesBtn")?.addEventListener("click", () => this.showTemplatesModal())
    document.getElementById("themeToggle")?.addEventListener("click", () => this.toggleTheme())
    document.getElementById("refreshPreview")?.addEventListener("click", () => this.updatePreview())
    document.getElementById("fullscreenPreview")?.addEventListener("click", () => this.toggleFullscreen())
    document.getElementById("clearConsole")?.addEventListener("click", () => this.clearConsole())
    document.getElementById("layoutToggle")?.addEventListener("click", () => this.toggleLayout())

    // Modal event listeners
    document.getElementById("closeTemplates")?.addEventListener("click", () => this.hideTemplatesModal())
    document.getElementById("closeShare")?.addEventListener("click", () => this.hideShareModal())
    document.getElementById("copyLink")?.addEventListener("click", () => this.copyShareLink())
    document.getElementById("exportGist")?.addEventListener("click", () => this.exportToGist())
    document.getElementById("exportCodepen")?.addEventListener("click", () => this.exportToCodepen())

    // Template selection
    document.querySelectorAll(".template-card").forEach((card) => {
      card.addEventListener("click", () => {
        const template = card.dataset.template
        this.loadTemplate(template)
        this.hideTemplatesModal()
      })
    })

    // Offline page reconnect
    document.getElementById("reconnectBtn")?.addEventListener("click", () => this.checkConnection())

    this.setupMobileEventListeners()

    document.addEventListener("keydown", (e) => {
      if (!this.isMobile && (e.ctrlKey || e.metaKey)) {
        switch (e.key) {
          case "s":
            e.preventDefault()
            this.saveCode()
            break
          case "Enter":
            e.preventDefault()
            this.runCode()
            break
          case "k":
            e.preventDefault()
            this.clearConsole()
            break
        }
      }
    })
  }

  setupMobileEventListeners() {
    const workspace = document.querySelector(".workspace")

    // Handle touch events for mobile navigation
    workspace?.addEventListener(
      "touchstart",
      (e) => {
        this.touchStartY = e.touches[0].clientY
        this.touchStartX = e.touches[0].clientX
      },
      { passive: true },
    )

    workspace?.addEventListener(
      "touchmove",
      (e) => {
        if (!this.isMobile) return

        const touchY = e.touches[0].clientY
        const touchX = e.touches[0].clientX
        const diffY = this.touchStartY - touchY
        const diffX = this.touchStartX - touchX

        // Prevent default scrolling behavior on certain elements
        if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
          e.preventDefault()
        }
      },
      { passive: false },
    )

    // Add orientation change handling
    window.addEventListener("orientationchange", () => {
      setTimeout(() => {
        this.handleOrientationChange()
      }, 100)
    })

    // Add viewport resize handling for mobile keyboards
    const initialViewportHeight = window.innerHeight
    window.addEventListener("resize", () => {
      const currentHeight = window.innerHeight
      const heightDiff = initialViewportHeight - currentHeight

      if (this.isMobile && heightDiff > 150) {
        // Mobile keyboard is likely open
        document.body.classList.add("keyboard-open")
      } else {
        document.body.classList.remove("keyboard-open")
      }
    })
  }

  handleOrientationChange() {
    this.isMobile = window.innerWidth <= 768

    // Refresh preview after orientation change
    setTimeout(() => {
      this.updatePreview()
    }, 300)

    // Update editor heights for better mobile experience
    if (this.isMobile) {
      document.querySelectorAll(".editor-panel").forEach((panel) => {
        panel.style.minHeight = window.innerHeight < 500 ? "150px" : "200px"
      })
    }
  }

  setupTheme() {
    document.documentElement.classList.toggle("dark", this.currentTheme === "dark")
    this.updateThemeIcon()
  }

  updateThemeIcon() {
    const themeToggle = document.getElementById("themeToggle")
    if (themeToggle) {
      const icon =
        this.currentTheme === "dark"
          ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>'
          : '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>'
      themeToggle.innerHTML = icon
    }
  }

  toggleTheme() {
    this.currentTheme = this.currentTheme === "light" ? "dark" : "light"
    localStorage.setItem("theme", this.currentTheme)
    document.documentElement.classList.toggle("dark", this.currentTheme === "dark")
    this.updateThemeIcon()
    this.showNotification(`Switched to ${this.currentTheme} theme`)
  }

  setupConnectionMonitoring() {
    window.addEventListener("online", () => {
      this.isOnline = true
      this.updateConnectionStatus()
      this.hideOfflinePage()
    })

    window.addEventListener("offline", () => {
      this.isOnline = false
      this.updateConnectionStatus()
      this.showOfflinePage()
    })

    this.updateConnectionStatus()
  }

  updateConnectionStatus() {
    const statusElement = document.getElementById("connectionStatus")
    const statusText = statusElement?.querySelector(".status-text")

    if (statusElement && statusText) {
      statusElement.className = `connection-status ${this.isOnline ? "online" : "offline"}`
      statusText.textContent = this.isOnline ? "Online" : "Offline"
    }
  }

  showOfflinePage() {
    const offlinePage = document.getElementById("offlinePage")
    if (offlinePage) {
      offlinePage.classList.remove("hidden")
    }
  }

  hideOfflinePage() {
    const offlinePage = document.getElementById("offlinePage")
    if (offlinePage) {
      offlinePage.classList.add("hidden")
    }
  }

  checkConnection() {
    if (navigator.onLine) {
      this.isOnline = true
      this.updateConnectionStatus()
      this.hideOfflinePage()
      this.showNotification("Connection restored!")
    } else {
      this.showNotification("Still offline. Please check your connection.")
    }
  }

  runCode() {
    this.updatePreview()
    this.showNotification("Code executed successfully!")
  }

  updatePreview() {
    const preview = document.getElementById("preview")
    if (!preview) return

    const html = this.editors.html?.value || ""
    const css = this.editors.css?.value || ""
    const js = this.editors.js?.value || ""

    const previewContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=yes">
        <title>Preview</title>
        <style>
          body { margin: 0; padding: 16px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
          * { box-sizing: border-box; }
          ${css}
        </style>
      </head>
      <body>
        ${html}
        <script>
          // Enhanced console capture for mobile
          (function() {
            const originalLog = console.log;
            const originalError = console.error;
            const originalWarn = console.warn;
            
            console.log = function(...args) {
              originalLog.apply(console, args);
              parent.postMessage({
                type: 'console',
                method: 'log',
                args: args.map(arg => typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg))
              }, '*');
            };
            
            console.error = function(...args) {
              originalError.apply(console, args);
              parent.postMessage({
                type: 'console',
                method: 'error',
                args: args.map(arg => typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg))
              }, '*');
            };
            
            console.warn = function(...args) {
              originalWarn.apply(console, args);
              parent.postMessage({
                type: 'console',
                method: 'warn',
                args: args.map(arg => typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg))
              }, '*');
            };
            
            window.addEventListener('error', function(e) {
              parent.postMessage({
                type: 'console',
                method: 'error',
                args: [e.message + ' (Line: ' + e.lineno + ')']
              }, '*');
            });
            
            try {
              ${js}
            } catch (error) {
              console.error('JavaScript Error:', error.message);
            }
          })();
        </script>
      </body>
      </html>
    `

    preview.src = "data:text/html;charset=utf-8," + encodeURIComponent(previewContent)
  }

  formatCode() {
    Object.entries(this.editors).forEach(([type, editor]) => {
      if (editor && editor.value.trim()) {
        try {
          let formatted = editor.value

          // Basic formatting for different languages
          if (type === "html") {
            formatted = this.formatHTML(formatted)
          } else if (type === "css") {
            formatted = this.formatCSS(formatted)
          } else if (type === "js") {
            formatted = this.formatJS(formatted)
          }

          editor.value = formatted
          this.saveToStorage()
        } catch (error) {
          console.error(`Error formatting ${type}:`, error)
        }
      }
    })

    this.showNotification("Code formatted successfully!")
  }

  formatHTML(html) {
    return html
      .replace(/></g, ">\n<")
      .replace(/^\s+|\s+$/gm, "")
      .split("\n")
      .map((line, index, array) => {
        const indent = this.calculateIndent(line, index, array)
        return "  ".repeat(indent) + line.trim()
      })
      .join("\n")
  }

  formatCSS(css) {
    return css
      .replace(/\{/g, " {\n  ")
      .replace(/\}/g, "\n}\n")
      .replace(/;/g, ";\n  ")
      .replace(/,/g, ",\n")
      .replace(/^\s+|\s+$/gm, "")
      .split("\n")
      .filter((line) => line.trim())
      .join("\n")
  }

  formatJS(js) {
    return js
      .replace(/\{/g, " {\n  ")
      .replace(/\}/g, "\n}")
      .replace(/;/g, ";\n")
      .replace(/^\s+|\s+$/gm, "")
      .split("\n")
      .filter((line) => line.trim())
      .join("\n")
  }

  calculateIndent(line, index, array) {
    let indent = 0
    for (let i = 0; i < index; i++) {
      const prevLine = array[i].trim()
      if (prevLine.includes("<") && !prevLine.includes("</") && !prevLine.endsWith("/>")) {
        indent++
      }
      if (prevLine.includes("</")) {
        indent--
      }
    }
    return Math.max(0, indent)
  }

  addConsoleMessage(method, args) {
    const console = document.getElementById("console")
    const consoleCount = document.querySelector(".console-count")

    if (console) {
      const messageDiv = document.createElement("div")
      messageDiv.className = `console-log console-${method}`

      const timestamp = new Date().toLocaleTimeString()
      const message = args.join(" ")

      messageDiv.innerHTML = `
        <span class="console-timestamp">[${timestamp}]</span>
        <span class="console-content">${message}</span>
      `

      console.appendChild(messageDiv)
      console.scrollTop = console.scrollHeight

      this.consoleMessages.push({ method, args, timestamp })

      if (consoleCount) {
        consoleCount.textContent = `${this.consoleMessages.length} messages`
      }
    }
  }

  clearConsole() {
    const console = document.getElementById("console")
    const consoleCount = document.querySelector(".console-count")

    if (console) {
      console.innerHTML = '<div class="console-welcome"><span class="console-prompt">></span> Console cleared.</div>'
    }

    if (consoleCount) {
      consoleCount.textContent = "0 messages"
    }

    this.consoleMessages = []
    this.showNotification("Console cleared")
  }

  saveCode() {
    this.saveToStorage()
    this.showNotification("Code saved locally!")
  }

  downloadCode() {
    const html = this.editors.html?.value || ""
    const css = this.editors.css?.value || ""
    const js = this.editors.js?.value || ""

    const fullHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CodePlayground Export</title>
    <style>
${css}
    </style>
</head>
<body>
${html}
    <script>
${js}
    </script>
</body>
</html>`

    const blob = new Blob([fullHTML], { type: "text/html" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "codeplayground-export.html"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    this.showNotification("Code downloaded successfully!")
  }

  clearCode() {
    if (confirm("Are you sure you want to clear all code? This action cannot be undone.")) {
      Object.values(this.editors).forEach((editor) => {
        if (editor) editor.value = ""
      })
      this.clearConsole()
      this.updatePreview()
      this.saveToStorage()
      this.showNotification("All code cleared")
    }
  }

  toggleLayout() {
    const workspace = document.querySelector(".workspace")
    if (workspace) {
      workspace.classList.toggle("vertical-layout")
      this.showNotification("Layout toggled")
    }
  }

  toggleFullscreen() {
    const preview = document.getElementById("preview")
    if (preview) {
      if (preview.requestFullscreen) {
        preview.requestFullscreen()
      } else if (preview.webkitRequestFullscreen) {
        preview.webkitRequestFullscreen()
      } else if (preview.msRequestFullscreen) {
        preview.msRequestFullscreen()
      }
    }
  }

  showTemplatesModal() {
    const modal = document.getElementById("templatesModal")
    if (modal) {
      modal.classList.add("show")
      if (this.isMobile) {
        document.body.style.overflow = "hidden"
      }
    }
  }

  hideTemplatesModal() {
    const modal = document.getElementById("templatesModal")
    if (modal) {
      modal.classList.remove("show")
      if (this.isMobile) {
        document.body.style.overflow = ""
      }
    }
  }

  showShareModal() {
    const modal = document.getElementById("shareModal")
    if (modal) {
      modal.classList.add("show")
      this.generateShareLink()
      if (this.isMobile) {
        document.body.style.overflow = "hidden"
      }
    }
  }

  hideShareModal() {
    const modal = document.getElementById("shareModal")
    if (modal) {
      modal.classList.remove("show")
      if (this.isMobile) {
        document.body.style.overflow = ""
      }
    }
  }

  generateShareLink() {
    const code = {
      html: this.editors.html?.value || "",
      css: this.editors.css?.value || "",
      js: this.editors.js?.value || "",
    }

    const encoded = btoa(JSON.stringify(code))
    const shareUrl = `${window.location.origin}${window.location.pathname}?code=${encoded}`

    const shareUrlInput = document.getElementById("shareUrl")
    if (shareUrlInput) {
      shareUrlInput.value = shareUrl
    }
  }

  copyShareLink() {
    const shareUrlInput = document.getElementById("shareUrl")
    if (shareUrlInput) {
      shareUrlInput.select()
      shareUrlInput.setSelectionRange(0, 99999) // For mobile devices

      try {
        document.execCommand("copy")
        this.showNotification("Link copied to clipboard!")
      } catch (err) {
        // Fallback for mobile devices
        if (navigator.share) {
          navigator.share({
            title: "CodePlayground Pro - Shared Code",
            url: shareUrlInput.value,
          })
        } else {
          this.showNotification("Please copy the link manually")
        }
      }
    }
  }

  exportToGist() {
    this.showNotification("GitHub Gist export coming soon!")
  }

  exportToCodepen() {
    const html = this.editors.html?.value || ""
    const css = this.editors.css?.value || ""
    const js = this.editors.js?.value || ""

    const form = document.createElement("form")
    form.action = "https://codepen.io/pen/define"
    form.method = "POST"
    form.target = "_blank"

    const input = document.createElement("input")
    input.type = "hidden"
    input.name = "data"
    input.value = JSON.stringify({
      title: "CodePlayground Pro Export",
      html: html,
      css: css,
      js: js,
    })

    form.appendChild(input)
    document.body.appendChild(form)
    form.submit()
    document.body.removeChild(form)

    this.showNotification("Exported to CodePen!")
  }

  loadTemplate(templateName) {
    const templates = this.getTemplates()
    const template = templates[templateName]

    if (template) {
      this.editors.html.value = template.html
      this.editors.css.value = template.css
      this.editors.js.value = template.js

      this.updatePreview()
      this.saveToStorage()
      this.showNotification(`${template.name} template loaded!`)
    }
  }

  getTemplates() {
    return {
      landing: {
        name: "Landing Page",
        html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Modern Landing Page</title>
</head>
<body>
    <nav class="navbar">
        <div class="nav-container">
            <div class="logo">Brand</div>
            <ul class="nav-menu">
                <li><a href="#home">Home</a></li>
                <li><a href="#about">About</a></li>
                <li><a href="#services">Services</a></li>
                <li><a href="#contact">Contact</a></li>
            </ul>
        </div>
    </nav>

    <section class="hero" id="home">
        <div class="hero-content">
            <h1 class="hero-title">Welcome to the Future</h1>
            <p class="hero-subtitle">Experience innovation like never before with our cutting-edge solutions.</p>
            <div class="hero-buttons">
                <button class="btn btn-primary">Get Started</button>
                <button class="btn btn-secondary">Learn More</button>
            </div>
        </div>
        <div class="hero-visual">
            <div class="floating-card">
                <h3>Feature 1</h3>
                <p>Amazing functionality</p>
            </div>
            <div class="floating-card">
                <h3>Feature 2</h3>
                <p>Incredible performance</p>
            </div>
            <div class="floating-card">
                <h3>Feature 3</h3>
                <p>Seamless integration</p>
            </div>
        </div>
    </section>

    <section class="features" id="about">
        <div class="container">
            <h2>Why Choose Us?</h2>
            <div class="features-grid">
                <div class="feature-card">
                    <div class="feature-icon">🚀</div>
                    <h3>Fast Performance</h3>
                    <p>Lightning-fast loading times and smooth interactions.</p>
                </div>
                <div class="feature-card">
                    <div class="feature-icon">🔒</div>
                    <h3>Secure & Reliable</h3>
                    <p>Enterprise-grade security with 99.9% uptime guarantee.</p>
                </div>
                <div class="feature-card">
                    <div class="feature-icon">📱</div>
                    <h3>Mobile First</h3>
                    <p>Perfectly optimized for all devices and screen sizes.</p>
                </div>
            </div>
        </div>
    </section>
</body>
</html>`,
        css: `* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    line-height: 1.6;
    color: #333;
    overflow-x: hidden;
}

.navbar {
    position: fixed;
    top: 0;
    width: 100%;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(20px);
    z-index: 1000;
    padding: 1rem 0;
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.nav-container {
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 2rem;
}

.logo {
    font-size: 1.5rem;
    font-weight: 700;
    background: linear-gradient(45deg, #667eea, #764ba2);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}

.nav-menu {
    display: flex;
    list-style: none;
    gap: 2rem;
}

.nav-menu a {
    text-decoration: none;
    color: #333;
    font-weight: 500;
    transition: color 0.3s ease;
}

.nav-menu a:hover {
    color: #667eea;
}

.hero {
    min-height: 100vh;
    display: flex;
    align-items: center;
    padding: 0 2rem;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    position: relative;
    overflow: hidden;
}

.hero::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="50" cy="50" r="1" fill="rgba(255,255,255,0.1)"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
    opacity: 0.3;
}

.hero-content {
    flex: 1;
    max-width: 600px;
    z-index: 2;
}

.hero-title {
    font-size: 3.5rem;
    font-weight: 800;
    margin-bottom: 1rem;
    line-height: 1.2;
}

.hero-subtitle {
    font-size: 1.25rem;
    margin-bottom: 2rem;
    opacity: 0.9;
}

.hero-buttons {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
}

.btn {
    padding: 1rem 2rem;
    border: none;
    border-radius: 50px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    text-decoration: none;
    display: inline-block;
}

.btn-primary {
    background: white;
    color: #667eea;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
}

.btn-secondary {
    background: transparent;
    color: white;
    border: 2px solid white;
}

.btn-secondary:hover {
    background: white;
    color: #667eea;
}

.hero-visual {
    flex: 1;
    position: relative;
    height: 500px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.floating-card {
    position: absolute;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 20px;
    padding: 2rem;
    text-align: center;
    transition: transform 0.3s ease;
    animation: float 6s ease-in-out infinite;
}

.floating-card:nth-child(1) {
    top: 10%;
    left: 10%;
    animation-delay: 0s;
}

.floating-card:nth-child(2) {
    top: 50%;
    right: 10%;
    animation-delay: 2s;
}

.floating-card:nth-child(3) {
    bottom: 10%;
    left: 30%;
    animation-delay: 4s;
}

@keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-20px); }
}

.features {
    padding: 5rem 2rem;
    background: #f8f9fa;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
}

.features h2 {
    text-align: center;
    font-size: 2.5rem;
    margin-bottom: 3rem;
    color: #333;
}

.features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
}

.feature-card {
    background: white;
    padding: 2rem;
    border-radius: 20px;
    text-align: center;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s ease;
    transform: translateY(-10px);
}

.feature-card:hover {
    transform: translateY(-20px);
}

.feature-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
}

.feature-card h3 {
    font-size: 1.5rem;
    margin-bottom: 1rem;
    color: #333;
}

.feature-card p {
    color: #666;
    line-height: 1.6;
}

/* Responsive Design */
@media (max-width: 768px) {
    .hero {
        flex-direction: column;
        text-align: center;
        padding: 2rem 1rem;
    }
    
    .hero-title {
        font-size: 2.5rem;
    }
    
    .hero-visual {
        height: 300px;
        margin-top: 2rem;
    }
    
    .nav-menu {
        display: none;
    }
}`,
        js: `console.log('🚀 Modern Landing Page Loaded!');

document.addEventListener('DOMContentLoaded', function() {
    // Smooth scrolling for navigation
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Interactive buttons
    const primaryBtn = document.querySelector('.btn-primary');
    const secondaryBtn = document.querySelector('.btn-secondary');
    
    if (primaryBtn) {
        primaryBtn.addEventListener('click', function() {
            // Create success animation
            this.style.transform = 'scale(0.95)';
            this.textContent = 'Welcome! 🎉';
            
            setTimeout(() => {
                this.style.transform = '';
                this.textContent = 'Get Started';
            }, 2000);
            
            console.log('Primary action triggered! 🎯');
        });
    }
    
    if (secondaryBtn) {
        secondaryBtn.addEventListener('click', function() {
            alert('Learn more about our amazing features!');
            console.log('Learn more clicked! 📚');
        });
    }

    // Parallax effect for floating cards
    window.addEventListener('scroll', function() {
        const scrolled = window.pageYOffset;
        const cards = document.querySelectorAll('.floating-card');
        
        cards.forEach((card, index) => {
            const speed = 0.5 + (index * 0.1);
            card.style.transform = \`translateY(\${scrolled * speed}px)\`;
        });
    });

    // Feature cards interaction
    const featureCards = document.querySelectorAll('.feature-card');
    featureCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.background = 'linear-gradient(135deg, #667eea, #764ba2)';
            this.style.color = 'white';
            this.style.transform = 'translateY(-10px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.background = 'white';
            this.style.color = '';
            this.style.transform = 'translateY(-10px)';
        });
    });
});`,
      },
      dashboard: {
        name: "Dashboard",
        html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Dashboard</title>
</head>
<body>
    <div class="dashboard">
        <aside class="sidebar">
            <div class="sidebar-header">
                <h2>Dashboard</h2>
            </div>
            <nav class="sidebar-nav">
                <a href="#" class="nav-item active">📊 Overview</a>
                <a href="#" class="nav-item">👥 Users</a>
                <a href="#" class="nav-item">📈 Analytics</a>
                <a href="#" class="nav-item">⚙️ Settings</a>
            </nav>
        </aside>
        
        <main class="main-content">
            <header class="header">
                <h1>Welcome back, Admin!</h1>
                <div class="user-info">
                    <span>John Doe</span>
                    <div class="avatar">JD</div>
                </div>
            </header>
            
            <div class="stats-grid">
                <div class="stat-card">
                    <h3>Total Users</h3>
                    <div class="stat-number">1,234</div>
                    <div class="stat-change positive">+12%</div>
                </div>
                <div class="stat-card">
                    <h3>Revenue</h3>
                    <div class="stat-number">$45,678</div>
                    <div class="stat-change positive">+8%</div>
                </div>
                <div class="stat-card">
                    <h3>Orders</h3>
                    <div class="stat-number">567</div>
                    <div class="stat-change negative">-3%</div>
                </div>
                <div class="stat-card">
                    <h3>Conversion</h3>
                    <div class="stat-number">3.2%</div>
                    <div class="stat-change positive">+0.5%</div>
                </div>
            </div>
            
            <div class="charts-section">
                <div class="chart-card">
                    <h3>Sales Overview</h3>
                    <div class="chart-placeholder">
                        <canvas id="salesChart" width="400" height="200"></canvas>
                    </div>
                </div>
                <div class="chart-card">
                    <h3>User Activity</h3>
                    <div class="activity-list">
                        <div class="activity-item">
                            <div class="activity-dot"></div>
                            <div class="activity-content">
                                <p>New user registered</p>
                                <span>2 minutes ago</span>
                            </div>
                        </div>
                        <div class="activity-item">
                            <div class="activity-dot"></div>
                            <div class="activity-content">
                                <p>Order #1234 completed</p>
                                <span>5 minutes ago</span>
                            </div>
                        </div>
                        <div class="activity-item">
                            <div class="activity-dot"></div>
                            <div class="activity-content">
                                <p>Payment received</p>
                                <span>10 minutes ago</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    </div>
</body>
</html>`,
        css: `* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    background: #f8fafc;
    color: #334155;
}

.dashboard {
    display: flex;
    min-height: 100vh;
}

.sidebar {
    width: 250px;
    background: white;
    border-right: 1px solid #e2e8f0;
    padding: 2rem 0;
}

.sidebar-header {
    padding: 0 2rem 2rem;
    border-bottom: 1px solid #e2e8f0;
}

.sidebar-header h2 {
    color: #1e293b;
    font-size: 1.5rem;
}

.sidebar-nav {
    padding: 2rem 0;
}

.nav-item {
    display: block;
    padding: 0.75rem 2rem;
    color: #64748b;
    text-decoration: none;
    transition: all 0.2s ease;
    border-left: 3px solid transparent;
}

.nav-item:hover,
.nav-item.active {
    background: #f1f5f9;
    color: #3b82f6;
    border-left-color: #3b82f6;
}

.main-content {
    flex: 1;
    padding: 2rem;
}

.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
}

.header h1 {
    color: #1e293b;
    font-size: 2rem;
}

.user-info {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.avatar {
    width: 40px;
    height: 40px;
    background: #3b82f6;
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
}

.stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
}

.stat-card {
    background: white;
    padding: 1.5rem;
    border-radius: 12px;
    border: 1px solid #e2e8f0;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.stat-card h3 {
    color: #64748b;
    font-size: 0.875rem;
    font-weight: 500;
    margin-bottom: 0.5rem;
}

.stat-number {
    font-size: 2rem;
    font-weight: 700;
    color: #1e293b;
    margin-bottom: 0.5rem;
}

.stat-change {
    font-size: 0.875rem;
    font-weight: 500;
}

.stat-change.positive {
    color: #059669;
}

.stat-change.negative {
    color: #dc2626;
}

.charts-section {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 1.5rem;
}

.chart-card {
    background: white;
    padding: 1.5rem;
    border-radius: 12px;
    border: 1px solid #e2e8f0;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.chart-card h3 {
    color: #1e293b;
    margin-bottom: 1rem;
}

.chart-placeholder {
    height: 200px;
    background: #f8fafc;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #64748b;
}

.activity-list {
    space-y: 1rem;
}

.activity-item {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    padding: 1rem 0;
    border-bottom: 1px solid #f1f5f9;
}

.activity-item:last-child {
    border-bottom: none;
}

.activity-dot {
    width: 8px;
    height: 8px;
    background: #3b82f6;
    border-radius: 50%;
    margin-top: 0.5rem;
}

.activity-content p {
    color: #1e293b;
    font-weight: 500;
    margin-bottom: 0.25rem;
}

.activity-content span {
    color: #64748b;
    font-size: 0.875rem;
}

@media (max-width: 768px) {
    .dashboard {
        flex-direction: column;
    }
    
    .sidebar {
        width: 100%;
        padding: 1rem 0;
    }
    
    .sidebar-nav {
        display: flex;
        overflow-x: auto;
        padding: 1rem 0;
    }
    
    .nav-item {
        white-space: nowrap;
        border-left: none;
        border-bottom: 3px solid transparent;
    }
    
    .nav-item:hover,
    .nav-item.active {
        border-left: none;
        border-bottom-color: #3b82f6;
    }
    
    .charts-section {
        grid-template-columns: 1fr;
    }
}`,
        js: `console.log('📊 Dashboard loaded successfully!');

document.addEventListener('DOMContentLoaded', function() {
    // Simulate real-time data updates
    function updateStats() {
        const statNumbers = document.querySelectorAll('.stat-number');
        statNumbers.forEach(stat => {
            const currentValue = parseInt(stat.textContent.replace(/[^0-9]/g, ''));
            const change = Math.floor(Math.random() * 10) - 5;
            const newValue = Math.max(0, currentValue + change);
            
            if (stat.textContent.includes('$')) {
                stat.textContent = '$' + newValue.toLocaleString();
            } else if (stat.textContent.includes('%')) {
                stat.textContent = (newValue / 100).toFixed(1) + '%';
            } else {
                stat.textContent = newValue.toLocaleString();
            }
        });
    }

    // Update stats every 5 seconds
    setInterval(updateStats, 5000);

    // Navigation interaction
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all items
            navItems.forEach(nav => nav.classList.remove('active'));
            
            // Add active class to clicked item
            this.classList.add('active');
            
            console.log('Navigated to:', this.textContent);
        });
    });

    // Simple chart simulation
    const canvas = document.getElementById('salesChart');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        
        // Draw a simple line chart
        function drawChart() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Chart data
            const data = [30, 45, 35, 60, 55, 70, 65, 80, 75, 90];
            const maxValue = Math.max(...data);
            
            // Draw grid lines
            ctx.strokeStyle = '#e2e8f0';
            ctx.lineWidth = 1;
            
            for (let i = 0; i <= 5; i++) {
                const y = (canvas.height / 5) * i;
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(canvas.width, y);
                ctx.stroke();
            }
            
            // Draw chart line
            ctx.strokeStyle = '#3b82f6';
            ctx.lineWidth = 3;
            ctx.beginPath();
            
            data.forEach((value, index) => {
                const x = (canvas.width / (data.length - 1)) * index;
                const y = canvas.height - (value / maxValue) * canvas.height;
                
                if (index === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            });
            
            ctx.stroke();
            
            // Draw data points
            ctx.fillStyle = '#3b82f6';
            data.forEach((value, index) => {
                const x = (canvas.width / (data.length - 1)) * index;
                const y = canvas.height - (value / maxValue) * canvas.height;
                
                ctx.beginPath();
                ctx.arc(x, y, 4, 0, 2 * Math.PI);
                ctx.fill();
            });
        }
        
        drawChart();
    }

    // Add new activity items periodically
    function addActivity() {
        const activities = [
            'New user registered',
            'Order completed',
            'Payment received',
            'Product updated',
            'User logged in',
            'Report generated'
        ];
        
        const activityList = document.querySelector('.activity-list');
        if (activityList) {
            const newActivity = document.createElement('div');
            newActivity.className = 'activity-item';
            newActivity.innerHTML = \`
                <div class="activity-dot"></div>
                <div class="activity-content">
                    <p>\${activities[Math.floor(Math.random() * activities.length)]}</p>
                    <span>Just now</span>
                </div>
            \`;
            
            activityList.insertBefore(newActivity, activityList.firstChild);
            
            // Remove old activities (keep only 5)
            const items = activityList.querySelectorAll('.activity-item');
            if (items.length > 5) {
                items[items.length - 1].remove();
            }
        }
    }
    
    // Add new activity every 10 seconds
    setInterval(addActivity, 10000);
    
    console.log('Dashboard interactions initialized! 🎯');
});`,
      },
      portfolio: {
        name: "Portfolio",
        html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>John Doe - Portfolio</title>
</head>
<body>
    <header class="header">
        <nav class="nav">
            <div class="logo">AK</div>
            <ul class="nav-menu">
                <li><a href="#home">Home</a></li>
                <li><a href="#about">About</a></li>
                <li><a href="#projects">Projects</a></li>
                <li><a href="#contact">Contact</a></li>
            </ul>
        </nav>
    </header>

    <section class="hero" id="home">
        <div class="hero-content">
            <h1>Hi, I'm <span class="highlight">Aniketh.K</span></h1>
            <p class="hero-subtitle">Full Stack Developer & UI/UX Designer</p>
            <p class="hero-description">I create beautiful, functional, and user-centered digital experiences.</p>
            <div class="hero-buttons">
                <a href="#projects" class="btn btn-primary">View My Work</a>
                <a href="#contact" class="btn btn-secondary">Get In Touch</a>
            </div>
        </div>
    </section>

    <section class="about" id="about">
        <div class="container">
            <h2>About Me</h2>
            <div class="about-content">
                <div class="about-text">
                    <p>I'm a passionate developer with 3+ years of experience creating digital solutions that make a difference. I specialize in modern web technologies and love turning complex problems into simple, beautiful designs.</p>
                    <div class="skills">
                        <div class="skill-item">JavaScript</div>
                        <div class="skill-item">React</div>
                        <div class="skill-item">Node.js</div>
                        <div class="skill-item">Python</div>
                        <div class="skill-item">UI/UX Design</div>
                        <div class="skill-item">MongoDB</div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <section class="projects" id="projects">
        <div class="container">
            <h2>Featured Projects</h2>
            <div class="projects-grid">
                <div class="project-card">
                    <div class="project-image">
                        <div class="project-placeholder">🚀</div>
                    </div>
                    <div class="project-content">
                        <h3>E-Commerce Platform</h3>
                        <p>A full-stack e-commerce solution built with React and Node.js</p>
                        <div class="project-tech">
                            <span>React</span>
                            <span>Node.js</span>
                            <span>MongoDB</span>
                        </div>
                        <div class="project-links">
                            <a href="#" class="project-link">Live Demo</a>
                            <a href="#" class="project-link">GitHub</a>
                        </div>
                    </div>
                </div>
                
                <div class="project-card">
                    <div class="project-image">
                        <div class="project-placeholder">📱</div>
                    </div>
                    <div class="project-content">
                        <h3>Mobile App Design</h3>
                        <p>UI/UX design for a fitness tracking mobile application</p>
                        <div class="project-tech">
                            <span>Figma</span>
                            <span>React Native</span>
                            <span>Firebase</span>
                        </div>
                        <div class="project-links">
                            <a href="#" class="project-link">View Design</a>
                            <a href="#" class="project-link">Prototype</a>
                        </div>
                    </div>
                </div>
                
                <div class="project-card">
                    <div class="project-image">
                        <div class="project-placeholder">📊</div>
                    </div>
                    <div class="project-content">
                        <h3>Analytics Dashboard</h3>
                        <p>Real-time data visualization dashboard for business metrics</p>
                        <div class="project-tech">
                            <span>Vue.js</span>
                            <span>D3.js</span>
                            <span>Express</span>
                        </div>
                        <div class="project-links">
                            <a href="#" class="project-link">Live Demo</a>
                            <a href="#" class="project-link">GitHub</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <section class="contact" id="contact">
        <div class="container">
            <h2>Let's Work Together</h2>
            <p>I'm always interested in new opportunities and exciting projects.</p>
            <div class="contact-info">
                <a href="mailto:john@example.com" class="contact-item">
                    <span class="contact-icon">📧</span>
                    john@example.com
                </a>
                <a href="https://linkedin.com/in/johndoe" class="contact-item">
                    <span class="contact-icon">💼</span>
                    LinkedIn
                </a>
                <a href="https://github.com/johndoe" class="contact-item">
                    <span class="contact-icon">🐙</span>
                    GitHub
                </a>
            </div>
        </div>
    </section>
</body>
</html>`,
        css: `* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    line-height: 1.6;
    color: #333;
    scroll-behavior: smooth;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 2rem;
}

.header {
    position: fixed;
    top: 0;
    width: 100%;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(20px);
    z-index: 1000;
    padding: 1rem 0;
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.nav {
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 2rem;
}

.logo {
    width: 40px;
    height: 40px;
    background: linear-gradient(45deg, #667eea, #764ba2);
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 1.2rem;
}

.nav-menu {
    display: flex;
    list-style: none;
    gap: 2rem;
}

.nav-menu a {
    text-decoration: none;
    color: #333;
    font-weight: 500;
    transition: color 0.3s ease;
}

.nav-menu a:hover {
    color: #667eea;
}

.hero {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    padding: 0 2rem;
}

.hero-content {
    max-width: 800px;
}

.hero h1 {
    font-size: 3.5rem;
    font-weight: 800;
    margin-bottom: 1rem;
    color: #2d3748;
}

.highlight {
    background: linear-gradient(45deg, #667eea, #764ba2);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}

.hero-subtitle {
    font-size: 1.5rem;
    color: #667eea;
    margin-bottom: 1rem;
    font-weight: 600;
}

.hero-description {
    font-size: 1.2rem;
    color: #4a5568;
    margin-bottom: 2rem;
}

.hero-buttons {
    display: flex;
    gap: 1rem;
    justify-content: center;
    flex-wrap: wrap;
}

.btn {
    padding: 1rem 2rem;
    border: none;
    border-radius: 50px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    text-decoration: none;
    display: inline-block;
}

.btn-primary {
    background: linear-gradient(45deg, #667eea, #764ba2);
    color: white;
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.6);
}

.btn-secondary {
    background: transparent;
    color: #667eea;
    border: 2px solid #667eea;
}

.btn-secondary:hover {
    background: #667eea;
    color: white;
}

.about {
    padding: 5rem 0;
    background: white;
}

.about h2 {
    text-align: center;
    font-size: 2.5rem;
    margin-bottom: 3rem;
    color: #2d3748;
}

.about-content {
    max-width: 800px;
    margin: 0 auto;
}

.about-text p {
    font-size: 1.2rem;
    color: #4a5568;
    margin-bottom: 2rem;
    text-align: center;
}

.skills {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    justify-content: center;
}

.skill-item {
    background: linear-gradient(45deg, #667eea, #764ba2);
    color: white;
    padding: 0.5rem 1rem;
    border-radius: 25px;
    font-weight: 500;
    font-size: 0.9rem;
}

.projects {
    padding: 5rem 0;
    background: #f8f9fa;
}

.projects h2 {
    text-align: center;
    font-size: 2.5rem;
    margin-bottom: 3rem;
    color: #2d3748;
}

.projects-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: 2rem;
}

.project-card {
    background: white;
    border-radius: 20px;
    overflow: hidden;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s ease;
}

.project-card:hover {
    transform: translateY(-10px);
}

.project-image {
    height: 200px;
    background: linear-gradient(45deg, #667eea, #764ba2);
    display: flex;
    align-items: center;
    justify-content: center;
}

.project-placeholder {
    font-size: 4rem;
    color: white;
}

.project-content {
    padding: 2rem;
}

.project-content h3 {
    font-size: 1.5rem;
    margin-bottom: 1rem;
    color: #2d3748;
}

.project-content p {
    color: #4a5568;
    margin-bottom: 1.5rem;
}

.project-tech {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-bottom: 1.5rem;
}

.project-tech span {
    background: #e2e8f0;
    color: #4a5568;
    padding: 0.25rem 0.75rem;
    border-radius: 15px;
    font-size: 0.8rem;
    font-weight: 500;
}

.project-links {
    display: flex;
    gap: 1rem;
}

.project-link {
    color: #667eea;
    text-decoration: none;
    font-weight: 600;
    transition: color 0.3s ease;
}

.project-link:hover {
    color: #764ba2;
}

.contact {
    padding: 5rem 0;
    background: white;
    text-align: center;
}

.contact h2 {
    font-size: 2.5rem;
    margin-bottom: 1rem;
    color: #2d3748;
}

.contact p {
    font-size: 1.2rem;
    color: #4a5568;
    margin-bottom: 3rem;
}

.contact-info {
    display: flex;
    justify-content: center;
    gap: 2rem;
    flex-wrap: wrap;
}

.contact-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 1rem 2rem;
    background: #f8f9fa;
    border-radius: 50px;
    text-decoration: none;
    color: #4a5568;
    font-weight: 500;
    transition: all 0.3s ease;
}

.contact-item:hover {
    background: linear-gradient(45deg, #667eea, #764ba2);
    color: white;
    transform: translateY(-2px);
}

.contact-icon {
    font-size: 1.2rem;
}

@media (max-width: 768px) {
    .hero h1 {
        font-size: 2.5rem;
    }
    
    .hero-buttons {
        flex-direction: column;
        align-items: center;
    }
    
    .nav-menu {
        display: none;
    }
    
    .projects-grid {
        grid-template-columns: 1fr;
    }
    
    .contact-info {
        flex-direction: column;
        align-items: center;
    }
}`,
        js: `console.log('💼 Portfolio loaded successfully!');

document.addEventListener('DOMContentLoaded', function() {
    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Navbar background on scroll
    window.addEventListener('scroll', function() {
        const header = document.querySelector('.header');
        if (window.scrollY > 100) {
            header.style.background = 'rgba(255, 255, 255, 0.98)';
        } else {
            header.style.background = 'rgba(255, 255, 255, 0.95)';
        }
    });

    // Project card interactions
    const projectCards = document.querySelectorAll('.project-card');
    projectCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.boxShadow = '0 8px 30px rgba(0, 0, 0, 0.15)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
        });
    });

    // Skill items animation on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Animate skill items
    const skillItems = document.querySelectorAll('.skill-item');
    skillItems.forEach((item, index) => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(20px)';
        item.style.transition = \`all 0.6s ease \${index * 0.1}s\`;
        observer.observe(item);
    });

    // Animate project cards
    projectCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = \`all 0.8s ease \${index * 0.2}s\`;
        observer.observe(card);
    });

    // Contact items hover effects
    const contactItems = document.querySelectorAll('.contact-item');
    contactItems.forEach(item => {
        item.addEventListener('click', function(e) {
            if (this.href.includes('mailto:')) {
                console.log('Opening email client...');
            } else if (this.href.includes('linkedin')) {
                console.log('Opening LinkedIn profile...');
            } else if (this.href.includes('github')) {
                console.log('Opening GitHub profile...');
            }
        });
    });

    // Typing effect for hero subtitle
    const subtitle = document.querySelector('.hero-subtitle');
    const originalText = subtitle.textContent;
    subtitle.textContent = '';
    
    let i = 0;
    function typeWriter() {
        if (i < originalText.length) {
            subtitle.textContent += originalText.charAt(i);
            i++;
            setTimeout(typeWriter, 100);
        }
    }
    
    // Start typing effect after a short delay
    setTimeout(typeWriter, 1000);

    console.log('Portfolio interactions initialized! ✨');
});`,
      },
      game: {
        name: "Simple Game",
        html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Space Shooter Game</title>
</head>
<body>
    <div class="game-container">
        <div class="game-header">
            <h1>🚀 Space Shooter</h1>
            <div class="game-stats">
                <div class="stat">
                    <span>Score: </span>
                    <span id="score">0</span>
                </div>
                <div class="stat">
                    <span>Lives: </span>
                    <span id="lives">3</span>
                </div>
                <div class="stat">
                    <span>Level: </span>
                    <span id="level">1</span>
                </div>
            </div>
        </div>
        
        <div class="game-area">
            <canvas id="gameCanvas" width="800" height="600"></canvas>
            <div class="game-overlay" id="gameOverlay">
                <div class="overlay-content">
                    <h2 id="overlayTitle">Space Shooter</h2>
                    <p id="overlayMessage">Use ARROW KEYS to move and SPACEBAR to shoot!</p>
                    <button id="startButton" class="game-button">Start Game</button>
                    <button id="restartButton" class="game-button hidden">Play Again</button>
                </div>
            </div>
        </div>
        
        <div class="game-controls">
            <div class="control-group">
                <h3>Controls</h3>
                <div class="controls-list">
                    <div class="control-item">
                        <span class="key">←→</span>
                        <span>Move</span>
                    </div>
                    <div class="control-item">
                        <span class="key">SPACE</span>
                        <span>Shoot</span>
                    </div>
                    <div class="control-item">
                        <span class="key">P</span>
                        <span>Pause</span>
                    </div>
                </div>
            </div>
            
            <div class="control-group">
                <h3>Power-ups</h3>
                <div class="powerups-list">
                    <div class="powerup-item">
                        <span class="powerup">⚡</span>
                        <span>Rapid Fire</span>
                    </div>
                    <div class="powerup-item">
                        <span class="powerup">🛡️</span>
                        <span>Shield</span>
                    </div>
                    <div class="powerup-item">
                        <span class="powerup">💥</span>
                        <span>Multi-shot</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</body>
</html>`,
        css: `* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    background: linear-gradient(135deg, #0c0c0c 0%, #1a1a2e 50%, #16213e 100%);
    color: white;
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;
}

.game-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    max-width: 1000px;
    width: 100%;
}

.game-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    max-width: 800px;
    padding: 1rem 2rem;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(20px);
    border-radius: 15px;
    border: 1px solid rgba(255, 255, 255, 0.2);
}

.game-header h1 {
    font-size: 2rem;
    font-weight: 800;
    background: linear-gradient(45deg, #00f5ff, #ff00ff);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    text-shadow: 0 0 20px rgba(0, 245, 255, 0.5);
}

.game-stats {
    display: flex;
    gap: 2rem;
}

.stat {
    display: flex;
    flex-direction: column;
    align-items: center;
    font-weight: 600;
}

.stat span:first-child {
    font-size: 0.8rem;
    opacity: 0.8;
}

.stat span:last-child {
    font-size: 1.5rem;
    color: #00f5ff;
    text-shadow: 0 0 10px rgba(0, 245, 255, 0.5);
}

.game-area {
    position: relative;
    border-radius: 15px;
    overflow: hidden;
    box-shadow: 0 0 50px rgba(0, 245, 255, 0.3);
}

#gameCanvas {
    display: block;
    background: radial-gradient(ellipse at center, #0f0f23 0%, #000000 100%);
    border: 2px solid rgba(0, 245, 255, 0.5);
    border-radius: 15px;
}

.game-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(10px);
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 15px;
    transition: opacity 0.3s ease;
}

.game-overlay.hidden {
    opacity: 0;
    pointer-events: none;
}

.overlay-content {
    text-align: center;
    padding: 2rem;
}

.overlay-content h2 {
    font-size: 3rem;
    font-weight: 800;
    margin-bottom: 1rem;
    background: linear-gradient(45deg, #00f5ff, #ff00ff);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    text-shadow: 0 0 20px rgba(0, 245, 255, 0.5);
}

.overlay-content p {
    font-size: 1.2rem;
    margin-bottom: 2rem;
    opacity: 0.9;
}

.game-button {
    background: linear-gradient(45deg, #00f5ff, #ff00ff);
    border: none;
    color: white;
    padding: 1rem 2rem;
    font-size: 1.1rem;
    font-weight: 600;
    border-radius: 50px;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 20px rgba(0, 245, 255, 0.4);
    margin: 0 0.5rem;
}

.game-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 30px rgba(0, 245, 255, 0.6);
}

.game-button.hidden {
    display: none;
}

.game-controls {
    display: flex;
    gap: 3rem;
    margin-top: 1rem;
}

.control-group {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(20px);
    border-radius: 15px;
    padding: 1.5rem;
    border: 1px solid rgba(255, 255, 255, 0.2);
    min-width: 200px;
}

.control-group h3 {
    font-size: 1.2rem;
    margin-bottom: 1rem;
    color: #00f5ff;
    text-align: center;
}

.controls-list,
.powerups-list {
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
}

.control-item,
.powerup-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 8px;
}

.key {
    background: rgba(0, 245, 255, 0.2);
    color: #00f5ff;
    padding: 0.3rem 0.6rem;
    border-radius: 6px;
    font-weight: 600;
    font-size: 0.9rem;
    border: 1px solid rgba(0, 245, 255, 0.3);
}

.powerup {
    font-size: 1.2rem;
    filter: drop-shadow(0 0 5px rgba(255, 255, 255, 0.5));
}

/* Responsive design */
@media (max-width: 900px) {
    .game-container {
        padding: 0.5rem;
    }
    
    #gameCanvas {
        width: 100%;
        max-width: 600px;
        height: auto;
    }
    
    .game-header {
        flex-direction: column;
        gap: 1rem;
        text-align: center;
    }
    
    .game-stats {
        gap: 1rem;
    }
    
    .game-controls {
        flex-direction: column;
        gap: 1rem;
        width: 100%;
        max-width: 400px;
    }
    
    .control-group {
        min-width: auto;
    }
}

@media (max-width: 600px) {
    .game-header h1 {
        font-size: 1.5rem;
    }
    
    .overlay-content h2 {
        font-size: 2rem;
    }
    
    .overlay-content p {
        font-size: 1rem;
    }
    
    .game-button {
        padding: 0.8rem 1.5rem;
        font-size: 1rem;
    }
}

/* Game animations */
@keyframes pulse {
    0%, 100% {
        opacity: 1;
    }
    50% {
        opacity: 0.7;
    }
}

.pulsing {
    animation: pulse 1s infinite;
}

@keyframes explosion {
    0% {
        transform: scale(1);
        opacity: 1;
    }
    100% {
        transform: scale(3);
        opacity: 0;
    }
}

.explosion {
    animation: explosion 0.5s ease-out;
}`,
        js: `console.log('🚀 Space Shooter Game Loading...');

class SpaceShooterGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.overlay = document.getElementById('gameOverlay');
        this.startButton = document.getElementById('startButton');
        this.restartButton = document.getElementById('restartButton');
        
        // Game state
        this.gameRunning = false;
        this.gamePaused = false;
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        
        // Game objects
        this.player = {
            x: this.canvas.width / 2 - 25,
            y: this.canvas.height - 80,
            width: 50,
            height: 40,
            speed: 5,
            color: '#00f5ff'
        };
        
        this.bullets = [];
        this.enemies = [];
        this.powerups = [];
        this.particles = [];
        
        // Game settings
        this.bulletSpeed = 7;
        this.enemySpeed = 2;
        this.enemySpawnRate = 0.02;
        this.powerupSpawnRate = 0.005;
        
        // Input handling
        this.keys = {};
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.resizeCanvas();
        this.showStartScreen();
        
        console.log('🎮 Game initialized successfully!');
    }
    
    setupEventListeners() {
        // Button events
        this.startButton.addEventListener('click', () => this.startGame());
        this.restartButton.addEventListener('click', () => this.restartGame());
        
        // Keyboard events
        document.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            
            if (e.code === 'Space') {
                e.preventDefault();
                if (this.gameRunning && !this.gamePaused) {
                    this.shoot();
                }
            }
            
            if (e.code === 'KeyP') {
                e.preventDefault();
                this.togglePause();
            }
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
        
        // Window resize
        window.addEventListener('resize', () => this.resizeCanvas());
    }
    
    resizeCanvas() {
        const container = this.canvas.parentElement;
        const maxWidth = Math.min(800, window.innerWidth - 40);
        const maxHeight = Math.min(600, window.innerHeight - 200);
        
        this.canvas.width = maxWidth;
        this.canvas.height = maxHeight;
        
        // Adjust player position
        this.player.x = Math.min(this.player.x, this.canvas.width - this.player.width);
        this.player.y = this.canvas.height - 80;
    }
    
    showStartScreen() {
        this.overlay.classList.remove('hidden');
        this.startButton.classList.remove('hidden');
        this.restartButton.classList.add('hidden');
        
        document.getElementById('overlayTitle').textContent = 'Space Shooter';
        document.getElementById('overlayMessage').textContent = 'Use ARROW KEYS to move and SPACEBAR to shoot!';
    }
    
    showGameOver() {
        this.overlay.classList.remove('hidden');
        this.startButton.classList.add('hidden');
        this.restartButton.classList.remove('hidden');
        
        document.getElementById('overlayTitle').textContent = 'Game Over';
        document.getElementById('overlayMessage').textContent = \`Final Score: \${this.score}\`;
    }
    
    startGame() {
        this.gameRunning = true;
        this.gamePaused = false;
        this.overlay.classList.add('hidden');
        this.gameLoop();
        
        console.log('🚀 Game started!');
    }
    
    restartGame() {
        // Reset game state
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        this.bullets = [];
        this.enemies = [];
        this.powerups = [];
        this.particles = [];
        
        // Reset player position
        this.player.x = this.canvas.width / 2 - 25;
        this.player.y = this.canvas.height - 80;
        
        this.updateUI();
        this.startGame();
    }
    
    togglePause() {
        if (this.gameRunning) {
            this.gamePaused = !this.gamePaused;
            console.log(this.gamePaused ? '⏸️ Game paused' : '▶️ Game resumed');
        }
    }
    
    gameLoop() {
        if (!this.gameRunning) return;
        
        if (!this.gamePaused) {
            this.update();
        }
        
        this.render();
        requestAnimationFrame(() => this.gameLoop());
    }
    
    update() {
        this.handleInput();
        this.updateBullets();
        this.updateEnemies();
        this.updatePowerups();
        this.updateParticles();
        this.spawnEnemies();
        this.spawnPowerups();
        this.checkCollisions();
        this.updateUI();
    }
    
    handleInput() {
        // Move player
        if (this.keys['ArrowLeft'] && this.player.x > 0) {
            this.player.x -= this.player.speed;
        }
        if (this.keys['ArrowRight'] && this.player.x < this.canvas.width - this.player.width) {
            this.player.x += this.player.speed;
        }
        if (this.keys['ArrowUp'] && this.player.y > this.canvas.height / 2) {
            this.player.y -= this.player.speed;
        }
        if (this.keys['ArrowDown'] && this.player.y < this.canvas.height - this.player.height) {
            this.player.y += this.player.speed;
        }
    }
    
    shoot() {
        this.bullets.push({
            x: this.player.x + this.player.width / 2 - 2,
            y: this.player.y,
            width: 4,
            height: 10,
            speed: this.bulletSpeed,
            color: '#ffff00'
        });
    }
    
    updateBullets() {
        this.bullets = this.bullets.filter(bullet => {
            bullet.y -= bullet.speed;
            return bullet.y > -bullet.height;
        });
    }
    
    spawnEnemies() {
        if (Math.random() < this.enemySpawnRate + this.level * 0.005) {
            this.enemies.push({
                x: Math.random() * (this.canvas.width - 40),
                y: -40,
                width: 40,
                height: 30,
                speed: this.enemySpeed + Math.random() * 2,
                color: '#ff0080',
                health: 1
            });
        }
    }
    
    updateEnemies() {
        this.enemies = this.enemies.filter(enemy => {
            enemy.y += enemy.speed;
            return enemy.y < this.canvas.height + enemy.height;
        });
    }
    
    spawnPowerups() {
        if (Math.random() < this.powerupSpawnRate) {
            const types = ['rapid', 'shield', 'multishot'];
            const type = types[Math.floor(Math.random() * types.length)];
            
            this.powerups.push({
                x: Math.random() * (this.canvas.width - 30),
                y: -30,
                width: 30,
                height: 30,
                speed: 2,
                type: type,
                color: type === 'rapid' ? '#ffff00' : type === 'shield' ? '#00ff00' : '#ff8000'
            });
        }
    }
    
    updatePowerups() {
        this.powerups = this.powerups.filter(powerup => {
            powerup.y += powerup.speed;
            return powerup.y < this.canvas.height + powerup.height;
        });
    }
    
    updateParticles() {
        this.particles = this.particles.filter(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.life--;
            particle.alpha = particle.life / particle.maxLife;
            return particle.life > 0;
        });
    }
    
    createExplosion(x, y, color = '#ffff00') {
        for (let i = 0; i < 10; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 10,
                vy: (Math.random() - 0.5) * 10,
                life: 30,
                maxLife: 30,
                color: color,
                alpha: 1,
                size: Math.random() * 4 + 2
            });
        }
    }
    
    checkCollisions() {
        // Bullet-enemy collisions
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            for (let j = this.enemies.length - 1; j >= 0; j--) {
                if (this.isColliding(this.bullets[i], this.enemies[j])) {
                    this.createExplosion(this.enemies[j].x + this.enemies[j].width / 2, 
                                       this.enemies[j].y + this.enemies[j].height / 2);
                    
                    this.bullets.splice(i, 1);
                    this.enemies.splice(j, 1);
                    this.score += 10;
                    
                    if (this.score % 100 === 0) {
                        this.level++;
                        console.log(\`🎉 Level up! Now on level \${this.level}\`);
                    }
                    break;
                }
            }
        }
        
        // Player-enemy collisions
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            if (this.isColliding(this.player, this.enemies[i])) {
                this.createExplosion(this.player.x + this.player.width / 2, 
                                   this.player.y + this.player.height / 2, '#ff0000');
                
                this.enemies.splice(i, 1);
                this.lives--;
                
                if (this.lives <= 0) {
                    this.gameRunning = false;
                    this.showGameOver();
                    console.log('💀 Game Over!');
                }
                break;
            }
        }
        
        // Player-powerup collisions
        for (let i = this.powerups.length - 1; i >= 0; i--) {
            if (this.isColliding(this.player, this.powerups[i])) {
                this.createExplosion(this.powerups[i].x + this.powerups[i].width / 2, 
                                   this.powerups[i].y + this.powerups[i].height / 2, 
                                   this.powerups[i].color);
                
                console.log(\`⚡ Powerup collected: \${this.powerups[i].type}\`);
                this.powerups.splice(i, 1);
                this.score += 5;
            }
        }
    }
    
    isColliding(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }
    
    render() {
        // Clear canvas
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw stars background
        this.drawStars();
        
        // Draw game objects
        this.drawPlayer();
        this.drawBullets();
        this.drawEnemies();
        this.drawPowerups();
        this.drawParticles();
        
        // Draw pause indicator
        if (this.gamePaused) {
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            this.ctx.font = '48px Inter';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('PAUSED', this.canvas.width / 2, this.canvas.height / 2);
        }
    }
    
    drawStars() {
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        for (let i = 0; i < 50; i++) {
            const x = (i * 37) % this.canvas.width;
            const y = (i * 73 + Date.now() * 0.01) % this.canvas.height;
            this.ctx.fillRect(x, y, 1, 1);
        }
    }
    
    drawPlayer() {
        this.ctx.fillStyle = this.player.color;
        this.ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);
        
        // Draw player as a simple spaceship shape
        this.ctx.beginPath();
        this.ctx.moveTo(this.player.x + this.player.width / 2, this.player.y);
        this.ctx.lineTo(this.player.x, this.player.y + this.player.height);
        this.ctx.lineTo(this.player.x + this.player.width, this.player.y + this.player.height);
        this.ctx.closePath();
        this.ctx.fill();
    }
    
    drawBullets() {
        this.bullets.forEach(bullet => {
            this.ctx.fillStyle = bullet.color;
            this.ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
            
            // Add glow effect
            this.ctx.shadowColor = bullet.color;
            this.ctx.shadowBlur = 10;
            this.ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
            this.ctx.shadowBlur = 0;
        });
    }
    
    drawEnemies() {
        this.enemies.forEach(enemy => {
            this.ctx.fillStyle = enemy.color;
            this.ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
            
            // Add glow effect
            this.ctx.shadowColor = enemy.color;
            this.ctx.shadowBlur = 5;
            this.ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
            this.ctx.shadowBlur = 0;
        });
    }
    
    drawPowerups() {
        this.powerups.forEach(powerup => {
            this.ctx.fillStyle = powerup.color;
            this.ctx.beginPath();
            this.ctx.arc(powerup.x + powerup.width / 2, powerup.y + powerup.height / 2, 
                        powerup.width / 2, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Add pulsing glow effect
            this.ctx.shadowColor = powerup.color;
            this.ctx.shadowBlur = 15 + Math.sin(Date.now() * 0.01) * 5;
            this.ctx.fill();
            this.ctx.shadowBlur = 0;
        });
    }
    
    drawParticles() {
        this.particles.forEach(particle => {
            this.ctx.save();
            this.ctx.globalAlpha = particle.alpha;
            this.ctx.fillStyle = particle.color;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        });
    }
    
    updateUI() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('lives').textContent = this.lives;
        document.getElementById('level').textContent = this.level;
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    const game = new SpaceShooterGame();
    
    console.log('🎮 Space Shooter Game ready to play!');
});`,
      },
    }
  }

  saveToStorage() {
    const code = {
      html: this.editors.html?.value || "",
      css: this.editors.css?.value || "",
      js: this.editors.js?.value || "",
      theme: this.currentTheme,
    }

    localStorage.setItem("codeplayground-code", JSON.stringify(code))
  }

  loadFromStorage() {
    try {
      const saved = localStorage.getItem("codeplayground-code")
      if (saved) {
        const code = JSON.parse(saved)

        if (this.editors.html) this.editors.html.value = code.html || ""
        if (this.editors.css) this.editors.css.value = code.css || ""
        if (this.editors.js) this.editors.js.value = code.js || ""

        if (code.theme) {
          this.currentTheme = code.theme
          this.setupTheme()
        }
      }
    } catch (error) {
      console.error("Error loading from storage:", error)
    }
  }

  showNotification(message) {
    const notification = document.createElement("div")
    notification.className = "notification"
    notification.textContent = message

    document.body.appendChild(notification)

    // Show notification
    setTimeout(() => {
      notification.classList.add("show")
    }, 100)

    // Hide and remove notification
    setTimeout(() => {
      notification.classList.remove("show")
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification)
        }
      }, 300)
    }, 3000)
  }

  debounce(func, wait) {
    let timeout
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout)
        func(...args)
      }
      clearTimeout(timeout)
      timeout = setTimeout(later, wait)
    }
  }
}

// Handle console messages from preview iframe
window.addEventListener("message", (event) => {
  if (event.data && event.data.type === "console") {
    if (window.codePlayground) {
      window.codePlayground.addConsoleMessage(event.data.method, event.data.args)
    }
  }
})

// Initialize CodePlayground Pro when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  try {
    window.codePlayground = new CodePlaygroundPro()
    console.log("🚀 CodePlayground Pro initialized successfully!")
  } catch (error) {
    console.error("Failed to initialize CodePlayground Pro:", error)
  }
})

window.addEventListener("resize", () => {
  clearTimeout(window.resizeTimer)
  window.resizeTimer = setTimeout(() => {
    if (window.codePlayground) {
      window.codePlayground.isMobile = window.innerWidth <= 768
      window.codePlayground.handleOrientationChange()
    }

    const preview = document.getElementById("preview")
    if (preview && preview.src) {
      // Gentle refresh on resize
      const currentSrc = preview.src
      preview.src = ""
      setTimeout(() => (preview.src = currentSrc), 100)
    }
  }, 300)
})
