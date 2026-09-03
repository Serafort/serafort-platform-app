import { useState, useRef, useEffect } from 'react';
import { Box, Fab, Drawer, Typography, IconButton, TextField, Paper, Avatar, Stack, Fade, InputAdornment, CircularProgress, Zoom } from '@mui/material';
import Close from '@mui/icons-material/Close';
import Send from '@mui/icons-material/Send';
import AutoAwesome from '@mui/icons-material/AutoAwesome';
import SmartToy from '@mui/icons-material/SmartToy';

const AIChatWidget = () => {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<any[]>([
    { id: 1, text: "Hello! I'm your AI Admin Assistant. How can I help you manage your authorization engine today?", type: 'ai' }
  ])
  const [isTyping, setIsTyping] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isTyping])

  const handleSend = () => {
    if (!input.trim()) return

    const userMsg = { id: Date.now(), text: input, type: 'user' }
    setMessages([...messages, userMsg])
    setInput('')
    setIsTyping(true)

    // Simulate AI response
    setTimeout(() => {
      setIsTyping(false)
      const aiMsg = {
        id: Date.now() + 1,
        text: "I've analyzed your request. Based on current access logs, you might want to review the ABAC policies for the 'Sensitive Data' resource. Would you like me to generate a draft policy for you?",
        type: 'ai'
      }
      setMessages(prev => [...prev, aiMsg])
    }, 1500)
  }

  return (
    <>
      <Zoom in={true} style={{ transitionDelay: '500ms' }}>
        <Fab
          color="primary"
          aria-label="ai-chat"
          onClick={() => setOpen(!open)}
          sx={{
            position: 'fixed',
            bottom: 32,
            right: 32,
            width: 64,
            height: 64,
            boxShadow: '0 8px 32px rgba(0, 97, 255, 0.4)',
            '&:hover': {
              transform: 'scale(1.1) rotate(5deg)',
            }
          }}
        >
          {open ? <Close /> : <SmartToy />}
        </Fab>
      </Zoom>

      <Drawer
        anchor="right"
        open={open}
        onClose={() => setOpen(false)}
        variant="temporary"
        PaperProps={{
          sx: {
            width: { xs: '100vw', sm: 400 },
            bgcolor: 'background.paper',
            boxShadow: -10,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }
        }}
      >
        <Box sx={{
          p: 3,
          bgcolor: 'primary.main',
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
        }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar sx={{ bgcolor: 'white', color: 'primary.main' }}>
              <AutoAwesome />
            </Avatar>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 900, lineHeight: 1.2 }}>NEURAL ASSISTANT</Typography>
              <Typography variant="caption" sx={{ opacity: 0.8, fontWeight: 700 }}>AI AGENT ONLINE</Typography>
            </Box>
          </Stack>
          <IconButton onClick={() => setOpen(false)} size="small" sx={{ color: 'white' }}>
            <Close />
          </IconButton>
        </Box>

        <Box
          ref={scrollRef}
          sx={{
            flexGrow: 1,
            p: 3,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            backgroundImage: 'radial-gradient(circle at top right, rgba(0,97,255,0.03) 0%, transparent 70%)'
          }}
        >
          {messages.map((msg) => (
            <Fade key={msg.id} in={true}>
              <Box sx={{
                alignSelf: msg.type === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '85%'
              }}>
                <Paper sx={{
                  p: 2,
                  borderRadius: msg.type === 'user' ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                  bgcolor: msg.type === 'user' ? 'primary.main' : 'action.selected',
                  color: msg.type === 'user' ? 'white' : 'text.primary',
                  boxShadow: msg.type === 'user' ? '0 4px 12px rgba(0, 97, 255, 0.2)' : 'none',
                  border: msg.type === 'user' ? 'none' : '1px solid',
                  borderColor: 'divider'
                }}>
                  <Typography variant="body2" sx={{ fontWeight: msg.type === 'user' ? 600 : 500, lineHeight: 1.5 }}>
                    {msg.text}
                  </Typography>
                </Paper>
              </Box>
            </Fade>
          ))}
          {isTyping && (
            <Box sx={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: 1, p: 1, bgcolor: 'action.selected', borderRadius: 10 }}>
              <CircularProgress size={16} />
              <Typography variant="caption" sx={{ fontWeight: 800 }}>AI is thinking...</Typography>
            </Box>
          )}
        </Box>

        <Box sx={{ p: 3, borderTop: '1px solid', borderColor: 'divider' }}>
          <TextField
            fullWidth
            placeholder="Ask neural assistant..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            size="small"
            autoComplete='off'
            InputProps={{
              sx: { borderRadius: 3, bgcolor: 'action.hover', border: 'none' },
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={handleSend} color="primary" disabled={!input.trim()}>
                    <Send />
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
        </Box>
      </Drawer>
    </>
  )
}

export default AIChatWidget
