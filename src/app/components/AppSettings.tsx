import { useState, useEffect } from 'react';
import { Box, Typography, Stack, Button, Avatar, TextField, IconButton, Paper } from '@mui/material';
import { Person as PersonIcon, CloudUpload as UploadIcon } from '@mui/icons-material';

export default function AppSettings() {
  const [userName, setUserName] = useState('');
  const [userAvatar, setUserAvatar] = useState('');

  useEffect(() => {
    setUserName(localStorage.getItem('userName') || '');
    setUserAvatar(localStorage.getItem('userAvatar') || '');
  }, []);

  const saveProfile = () => {
    localStorage.setItem('userName', userName);
    localStorage.setItem('userAvatar', userAvatar);
    window.dispatchEvent(new Event('storage'));
  };

  const handleAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const url = ev.target?.result as string;
      setUserAvatar(url);
      localStorage.setItem('userAvatar', url);
      window.dispatchEvent(new Event('storage'));
    };
    reader.readAsDataURL(file);
  };

  return (
    <Paper sx={{ p: 4, bgcolor: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)' }}>
      <Stack spacing={4} alignItems="center">
        <Box sx={{ position: 'relative' }}>
          <Avatar src={userAvatar} sx={{ width: 120, height: 120, border: '4px solid', borderColor: 'primary.main' }}>
            <PersonIcon sx={{ fontSize: 60 }} />
          </Avatar>
          <IconButton component="label" sx={{ position: 'absolute', bottom: 0, right: 0, bgcolor: 'primary.main', color: 'white' }}>
            <UploadIcon /><input type="file" hidden accept="image/*" onChange={handleAvatar} />
          </IconButton>
        </Box>
        <TextField label="用户名" value={userName} onChange={e => setUserName(e.target.value)} fullWidth />
        <Button variant="contained" onClick={saveProfile} size="large">保存个人资料</Button>
      </Stack>
    </Paper>
  );
}
