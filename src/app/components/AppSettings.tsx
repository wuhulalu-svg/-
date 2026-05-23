import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Stack,
  Button,
  Card,
  Avatar,
  TextField,
  IconButton,
  Paper,
} from '@mui/material';
import {
  Person as PersonIcon,
  CloudUpload as UploadIcon,
} from '@mui/icons-material';

export default function AppSettings() {
  const [userName, setUserName] = useState('');
  const [userAvatar, setUserAvatar] = useState('');

  useEffect(() => {
    const savedName = localStorage.getItem('userName');
    const savedAvatar = localStorage.getItem('userAvatar');

    if (savedName) setUserName(savedName);
    if (savedAvatar) setUserAvatar(savedAvatar);
  }, []);

  const saveUserProfile = () => {
    localStorage.setItem('userName', userName);
    localStorage.setItem('userAvatar', userAvatar);
    window.dispatchEvent(new Event('storage'));
  };

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setUserAvatar(result);
        localStorage.setItem('userAvatar', result);
        window.dispatchEvent(new Event('storage'));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Box>
      <Paper elevation={2} sx={{ bgcolor: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)' }}>
        <Box sx={{ p: 4 }}>
          <Stack spacing={4} maxWidth={600}>
            <Box sx={{ textAlign: 'center' }}>
              <Box sx={{ position: 'relative', display: 'inline-block', mb: 3 }}>
                <Avatar
                  src={userAvatar}
                  sx={{
                    width: 120,
                    height: 120,
                    border: '4px solid',
                    borderColor: 'primary.main',
                    boxShadow: 3,
                  }}
                >
                  <PersonIcon sx={{ fontSize: 60 }} />
                </Avatar>
                <IconButton
                  component="label"
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    bgcolor: 'primary.main',
                    color: 'white',
                    '&:hover': {
                      bgcolor: 'primary.dark',
                    },
                  }}
                >
                  <UploadIcon />
                  <input type="file" hidden accept="image/*" onChange={handleAvatarUpload} />
                </IconButton>
              </Box>
            </Box>

            <TextField
              label="用户名"
              placeholder="输入您的名字"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              fullWidth
            />

            <Button
              variant="contained"
              size="large"
              onClick={saveUserProfile}
              sx={{ textTransform: 'none' }}
            >
              保存个人资料
            </Button>
          </Stack>
        </Box>
      </Paper>
    </Box>
  );
}
