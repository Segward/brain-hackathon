# PlantUML Diagrams for Autonomipartiet

This directory contains PlantUML diagrams documenting the architecture and tech stack of the Autonomipartiet AI Chat application.

## 📊 Available Diagrams

### 1. **architecture.puml** - Complete System Architecture
**Type:** Component Diagram  
**Purpose:** Shows the complete system architecture with all layers, components, and connections.

**Includes:**
- Frontend layer (Main + Temp frontends)
- Application layer (Spring Boot backend with all controllers and services)
- Data layer (PostgreSQL, Redis, pgAdmin)
- Cache layer (Redis with TTL and AOF)
- External services (NTNU HPC LLM)
- System prompts (rules.txt, policy.txt)
- Detailed notes on technologies and statistics

**Best for:** Understanding the complete system and how all parts connect.

---

### 2. **deployment.puml** - Docker Deployment Diagram
**Type:** Deployment Diagram  
**Purpose:** Shows Docker container setup, networking, and volume persistence.

**Includes:**
- All 6 Docker containers
- Docker bridge network
- Volume mounts (postgres_data, redis_data, pgadmin_data)
- Port mappings
- Multi-stage build notes
- Healthcheck configurations
- User connections

**Best for:** Understanding Docker deployment and infrastructure.

---

### 3. **sequence-flow.puml** - Chat Request Sequence
**Type:** Sequence Diagram  
**Purpose:** Shows the complete flow of a chat request from user to response.

**Includes:**
- User interaction flow
- Cache hit vs cache miss scenarios
- SSE streaming process
- LLM API integration
- Database persistence
- Performance comparison notes
- Step-by-step timing

**Best for:** Understanding data flow and request/response lifecycle.

---

### 4. **backend-classes.puml** - Backend Class Structure
**Type:** Class Diagram  
**Purpose:** Shows the Java backend class structure and relationships.

**Includes:**
- Entity layer (Conversation)
- DTO layer (ConversationDTO)
- Repository layer (ConversationRepository)
- Service layer (ChatService, IO)
- Controller layer (all 4 controllers)
- Configuration layer (CacheConfig, WebConfig)
- Spring Boot application class
- Relationships and dependencies

**Best for:** Understanding backend code structure and Spring Boot architecture.

---

### 5. **tech-stack.puml** - Complete Tech Stack
**Type:** Component Diagram  
**Purpose:** Shows all technologies used across the entire stack.

**Includes:**
- Frontend technologies (Vue, Vite, Tailwind, Nginx)
- Backend technologies (Java, Spring Boot, Maven, Hibernate)
- Data layer (PostgreSQL, Redis, pgAdmin)
- Infrastructure (Docker, Docker Compose, multi-stage builds)
- External services (NTNU HPC LLM)
- Version numbers for all major technologies

**Best for:** Presenting the technology choices and stack overview.

---

### 6. **simple-overview.puml** - Simple Architecture Overview
**Type:** Component Diagram (Simplified)  
**Purpose:** High-level overview for quick understanding.

**Includes:**
- User interactions
- Frontend layer (both frontends)
- Application layer (backend)
- Data layer (PostgreSQL + Redis)
- External LLM service
- Docker infrastructure
- Key performance metrics
- AI personas

**Best for:** Quick presentations and high-level understanding.

---

## 🎨 How to Use PlantUML Diagrams

### Online Rendering

**Option 1: PlantUML Web Server**
```
http://www.plantuml.com/plantuml/uml/
```
Paste the content of any `.puml` file and click "Submit"

**Option 2: PlantText**
```
https://www.planttext.com/
```
Paste the diagram code and see live preview

**Option 3: PlantUML Online Editor**
```
https://plantuml-editor.kkeisuke.com/
```
Real-time rendering as you type

### Local Rendering

**Install PlantUML:**
```bash
# macOS
brew install plantuml

# Ubuntu/Debian
sudo apt-get install plantuml

# Or download JAR
wget https://sourceforge.net/projects/plantuml/files/plantuml.jar/download
```

**Generate PNG images:**
```bash
# Single diagram
plantuml architecture.puml

# All diagrams
plantuml docs/*.puml

# With output directory
plantuml -o ../diagrams docs/*.puml

# As SVG (scalable)
plantuml -tsvg architecture.puml
```

**Generate PDF:**
```bash
plantuml -tpdf architecture.puml
```

### VSCode Integration

**Install Extension:**
1. Open VSCode
2. Go to Extensions (Cmd+Shift+X)
3. Search for "PlantUML"
4. Install "PlantUML" by jebbs

**Preview Diagram:**
- Open any `.puml` file
- Press `Alt+D` or `Option+D` (macOS)
- Or right-click → "Preview Current Diagram"

**Export:**
- Right-click in preview
- Select export format (PNG, SVG, PDF)

### IntelliJ IDEA Integration

**Install Plugin:**
1. Go to Settings → Plugins
2. Search for "PlantUML integration"
3. Install and restart

**Preview:**
- Open `.puml` file
- Preview panel shows live rendering
- Export via right-click menu

---

## 📝 Diagram Syntax Quick Reference

### Components
```plantuml
component "Component Name" as Alias
[Simple Component]
```

### Databases
```plantuml
database "Database Name" as DB
```

### Connections
```plantuml
Component1 --> Component2 : Label
Component1 -down-> Component2
Component1 ..> Component2 : dashed
```

### Notes
```plantuml
note right of Component
  Multi-line note
  with details
end note
```

### Packages
```plantuml
package "Package Name" {
  [Component1]
  [Component2]
}
```

### Colors
```plantuml
component "Name" #LightBlue
database "DB" #LightPink
```

---

## 🎯 Recommended Diagrams for Presentation

### For Technical Audience:
1. **architecture.puml** - Show complete system
2. **backend-classes.puml** - Explain code structure
3. **sequence-flow.puml** - Demonstrate request flow

### For Non-Technical Audience:
1. **simple-overview.puml** - High-level overview
2. **deployment.puml** - Show infrastructure
3. **sequence-flow.puml** - Explain how it works

### For Demo/Hackathon:
1. **simple-overview.puml** - Quick intro (1 slide)
2. **tech-stack.puml** - Show technologies (1 slide)
3. **sequence-flow.puml** - Explain caching benefit (1 slide)

---

## 🖼️ Export Recommendations

### For Slides (PowerPoint, Keynote):
```bash
plantuml -tsvg *.puml
```
SVG scales perfectly at any size

### For Documentation (Markdown, Confluence):
```bash
plantuml -tpng -Sdefault *.puml
```
PNG with default resolution

### For Print (Poster, Handout):
```bash
plantuml -tpng -Sdpi=300 *.puml
```
High-resolution PNG

### For PDF Report:
```bash
plantuml -tpdf *.puml
```
Vector PDF for professional documents

---

## 🔧 Customization

### Change Colors:
Edit the color definitions at the top of each file:
```plantuml
!define BACKEND_COLOR #E1F5FE
!define FRONTEND_COLOR #FFF3E0
```

### Change Layout:
Add layout hints:
```plantuml
left to right direction
skinparam linetype ortho
```

### Add More Details:
Expand notes and add more components as needed.

---

## 📚 PlantUML Resources

- **Official Site:** https://plantuml.com/
- **Documentation:** https://plantuml.com/guide
- **Component Diagram:** https://plantuml.com/component-diagram
- **Sequence Diagram:** https://plantuml.com/sequence-diagram
- **Deployment Diagram:** https://plantuml.com/deployment-diagram
- **Class Diagram:** https://plantuml.com/class-diagram

---

## 🎨 Diagram Previews

All diagrams are text-based and can be rendered to:
- PNG (raster image)
- SVG (vector image - recommended for slides)
- PDF (for documents)
- ASCII art (for terminal viewing)

---

**Created:** 2026-02-14  
**Last Updated:** 2026-02-14  
**Total Diagrams:** 6
