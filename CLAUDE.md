# AIMeetings - AI-Enhanced Videoconferencing Platform

## Project Vision
Build a functional, working videoconferencing platform with real-time AI transcription (Deepgram API) and AI-enhanced insights (OpenAI API screen capture/contextualization).

## Development Principles

### Core Values
- **Clean, Simple Code**: Prioritize readability and maintainability over complexity
- **Secure Architecture**: Implement security best practices from the ground up
- **Modular Design**: Isolated services that can be developed, tested, and deployed independently
- **Extensible Framework**: Easy to add new capabilities without breaking existing functionality

### Technical Guidelines

#### Architecture
- **Microservices**: Each feature (video, transcription, insights) as separate containerized services
- **API Gateway**: Single entry point with routing, authentication, and rate limiting
- **Event-Driven**: Services communicate via message queues (Redis/RabbitMQ)
- **Database per Service**: PostgreSQL for persistent data, Redis for real-time state

#### Code Standards
- **TypeScript**: Strong typing prevents runtime errors
- **No Over-Engineering**: Use simple, proven patterns over complex abstractions
- **Service Isolation**: Each service has well-defined interfaces and responsibilities
- **Security First**: Environment variables for secrets, JWT auth, input validation

#### Testing & Deployment
- **Incremental Development**: Build in phases with testing milestones
- **Docker Containerization**: Consistent environments from dev to production
- **CI/CD Ready**: Structure supports automated testing and deployment

## Technology Stack

### Frontend
- **React + TypeScript**: Component-based UI with type safety
- **WebRTC**: Direct peer-to-peer video communication
- **Socket.IO**: Real-time signaling and messaging

### Backend Services
- **API Gateway**: Express.js with authentication middleware
- **User Service**: JWT-based authentication and room management
- **Signaling Service**: WebSocket connections for WebRTC coordination
- **Media Service**: Mediasoup SFU for scalable video routing
- **Transcription Service**: Deepgram API integration
- **Insights Service**: OpenAI API for screen analysis

### Infrastructure
- **Docker**: Service containerization
- **PostgreSQL**: Primary database
- **Redis**: Real-time state and message queuing
- **NGINX**: Reverse proxy and static file serving

## Development Phases

### Phase 1: Core Video Platform
- Basic 2-4 person video conferencing
- Room management and user authentication
- Clean UI with video grid and controls

### Phase 2: AI Transcription
- Real-time speech-to-text with Deepgram
- Live transcript display and storage
- Audio streaming pipeline

### Phase 3: AI Insights
- Screen capture functionality
- OpenAI-powered meeting analysis
- Insights dashboard and visualization

## Success Metrics
- **Functional**: Multi-person video calls work reliably
- **Extensible**: New features can be added as isolated services
- **Secure**: No exposed secrets, proper authentication
- **Maintainable**: Clear code structure and documentation

## Future Capabilities
- Meeting recordings and playback
- Advanced AI features (sentiment analysis, action items)
- Mobile app support
- Enterprise integrations
- Advanced analytics and reporting

---

*This document serves as the north star for development decisions. All code should align with these principles.*