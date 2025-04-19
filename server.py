import os
import http.server
import socketserver

PORT = 8000

web_dir = os.path.join(os.path.dirname(__file__), 'public')
os.chdir(web_dir)

Handler = http.server.SimpleHTTPRequestHandler

with socketserver.TCPServer(("", PORT), Handler) as httpd:
    print(f"Site aberto em: http://localhost:{PORT}")
    httpd.serve_forever()
