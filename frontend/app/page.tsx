export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Hero Section */}
      <div className="container mx-auto px-6 pt-20 pb-16">
        <div className="text-center">
          <h1 className="text-6xl md:text-8xl font-bold text-white mb-6">
            browser.autos
          </h1>
          <p className="text-2xl md:text-3xl text-slate-300 mb-4 font-light">
            Cloud-Native Headless Browser Platform
          </p>
          <p className="text-xl md:text-2xl text-blue-400 mb-12 font-medium">
            Write code. Run anywhere. Scrape everything.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <a
              href="https://github.com/browser-autos/browser-autos"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors"
            >
              View on GitHub
            </a>
            <a
              href="https://hub.docker.com/r/browserautos/browser-autos"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-slate-700 hover:bg-slate-600 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors"
            >
              Pull from Docker Hub
            </a>
          </div>

          {/* Quick Start */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-8 max-w-3xl mx-auto">
            <h3 className="text-xl text-slate-300 mb-4 font-semibold">⚡ One Command to Start</h3>
            <pre className="bg-slate-900 p-4 rounded-lg overflow-x-auto text-left">
              <code className="text-green-400 text-sm">
{`docker run -d -p 3001:3001 \\
  -e JWT_SECRET=your-secret \\
  --shm-size=2gb \\
  browserautos/browser-autos:latest`}
              </code>
            </pre>
            <p className="text-slate-400 mt-4 text-sm">That's it. Your headless browser platform is running.</p>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="container mx-auto px-6 py-16">
        <h2 className="text-4xl font-bold text-white text-center mb-12">Why browser.autos?</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: "🐳",
              title: "Container-First",
              description: "Deploy anywhere - Docker, Kubernetes, AWS, GCP, Azure"
            },
            {
              icon: "⚡",
              title: "Lightning Fast",
              description: "85% faster with intelligent browser pool management"
            },
            {
              icon: "🔒",
              title: "Secure by Default",
              description: "JWT auth, non-root execution, resource limits"
            },
            {
              icon: "🌍",
              title: "Multi-Architecture",
              description: "AMD64 + ARM64 (Apple Silicon, AWS Graviton)"
            },
            {
              icon: "📊",
              title: "Observable",
              description: "Prometheus metrics + structured logging"
            },
            {
              icon: "🎯",
              title: "Developer Friendly",
              description: "REST APIs + WebSocket CDP + Swagger docs"
            }
          ].map((feature, i) => (
            <div key={i} className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-6 hover:border-blue-500 transition-colors">
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-slate-400">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Use Cases */}
      <div className="container mx-auto px-6 py-16">
        <h2 className="text-4xl font-bold text-white text-center mb-12">What You Can Build</h2>
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {[
            { icon: "📸", title: "Screenshot Service", desc: "Visual regression testing, thumbnails" },
            { icon: "📄", title: "PDF Generator", desc: "Reports, invoices at scale" },
            { icon: "🕷️", title: "Web Scraper", desc: "Price monitoring, content aggregation" },
            { icon: "🧪", title: "Testing Platform", desc: "E2E tests, CI/CD integration" },
          ].map((useCase, i) => (
            <div key={i} className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-6 flex items-start gap-4">
              <div className="text-3xl">{useCase.icon}</div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">{useCase.title}</h3>
                <p className="text-slate-400 text-sm">{useCase.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Code Example */}
      <div className="container mx-auto px-6 py-16">
        <h2 className="text-4xl font-bold text-white text-center mb-12">Simple REST API</h2>
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-8 max-w-3xl mx-auto">
          <pre className="overflow-x-auto">
            <code className="text-blue-300 text-sm">
{`# Take a screenshot
curl -X POST http://localhost:3001/screenshot \\
  -d '{"url": "https://example.com"}' \\
  -o screenshot.png

# Generate PDF
curl -X POST http://localhost:3001/pdf \\
  -d '{"url": "https://example.com"}' \\
  -o document.pdf

# Extract data
curl -X POST http://localhost:3001/scrape \\
  -d '{"url": "https://example.com", "elements": [{"selector": "h1"}]}'`}
            </code>
          </pre>
        </div>
      </div>

      {/* Footer */}
      <footer className="container mx-auto px-6 py-12 border-t border-slate-700">
        <div className="text-center text-slate-400">
          <p className="mb-4">
            <strong className="text-white">MIT License</strong> · Free for Commercial Use · No Vendor Lock-in
          </p>
          <div className="flex gap-6 justify-center text-sm">
            <a href="https://github.com/browser-autos/browser-autos" className="hover:text-blue-400 transition-colors">GitHub</a>
            <a href="https://hub.docker.com/r/browserautos/browser-autos" className="hover:text-blue-400 transition-colors">Docker Hub</a>
            <a href="https://github.com/browser-autos/browser-autos/blob/main/README.md" className="hover:text-blue-400 transition-colors">Documentation</a>
          </div>
          <p className="mt-6 text-sm text-slate-500">
            Making browser automation accessible to everyone, everywhere
          </p>
        </div>
      </footer>
    </main>
  );
}
