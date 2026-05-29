import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Stack,
  Avatar,
  IconButton,
} from '@mui/material';
import {
  CalendarMonth as CalendarMonthIcon,
  Psychology as PsychologyIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import StrategySettings from './StrategySettings';
import AppSettings from './AppSettings';
import MobileScheduleView from './MobileScheduleView';
import InspirationView from './InspirationView';
import InstallPrompt from './InstallPrompt';

export default function MainLayout() {
  const [selectedView, setSelectedView] = useState<'strategy' | 'schedule' | 'settings' | 'plan'>('plan');
  const [sidebarBackground, setSidebarBackground] = useState<string>('');
  const [userName, setUserName] = useState('');
  const [userAvatar, setUserAvatar] = useState('');

  // 图标状态
  const [planIcon, setPlanIcon] = useState('');
  const [strategyIcon, setStrategyIcon] = useState('');
  const [inspireIcon, setInspireIcon] = useState('');
  const [profileIcon, setProfileIcon] = useState('');

  useEffect(() => {
    const savedSidebarBg = localStorage.getItem('sidebarBackgroundImage');
    const savedName = localStorage.getItem('userName');
    const savedAvatar = localStorage.getItem('userAvatar');
    if (savedSidebarBg) setSidebarBackground(savedSidebarBg);
    if (savedName) setUserName(savedName);
    if (savedAvatar) setUserAvatar(savedAvatar);
  }, []);

  // 加载图标
  const loadIcons = () => {
    setPlanIcon(localStorage.getItem('planIcon') || '');
    setStrategyIcon(localStorage.getItem('strategyIcon') || '');
    setInspireIcon(localStorage.getItem('inspireIcon') || '');
    setProfileIcon(localStorage.getItem('profileIcon') || '');
  };

  useEffect(() => {
    loadIcons();
    window.addEventListener('storage', loadIcons);
    return () => window.removeEventListener('storage', loadIcons);
  }, []);

  const handleAddClick = () => {
    if (selectedView === 'plan') {
      window.dispatchEvent(new CustomEvent('openAddPlanDialog'));
    } else if (selectedView === 'strategy') {
      window.dispatchEvent(new CustomEvent('openAddStrategyDialog'));
    } else if (selectedView === 'schedule') {
      window.dispatchEvent(new CustomEvent('openAddInspirationItem'));
    } else {
      setSelectedView('plan');
      window.dispatchEvent(new CustomEvent('openAddPlanDialog'));
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: '#FAFAFA' }}>
      {/* 底部导航栏 */}
      <Box
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          height: 70,
          bgcolor: 'rgba(255,255,255,0.98)',
          borderTop: '1px solid',
          borderColor: 'divider',
          backdropFilter: 'blur(20px)',
          zIndex: 1000,
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          px: 2,
        }}
      >
        {/* 做计划 */}
        <IconButton
          onClick={() => setSelectedView('plan')}
          sx={{ flexDirection: 'column', gap: 0.5, color: selectedView === 'plan' ? '#333' : 'text.secondary' }}
        >
          {planIcon ? (
            <Box component="img" src={planIcon} sx={{ width: 24, height: 24 }} />
          ) : (
            <CalendarMonthIcon />
          )}
          <Typography variant="caption" sx={{ fontSize: '0.65rem' }}>做计划</Typography>
        </IconButton>

        {/* 策略 */}
        <IconButton
          onClick={() => setSelectedView('strategy')}
          sx={{ flexDirection: 'column', gap: 0.5, color: selectedView === 'strategy' ? '#333' : 'text.secondary' }}
        >
          {strategyIcon ? (
            <Box component="img" src={strategyIcon} sx={{ width: 24, height: 24 }} />
          ) : (
            <PsychologyIcon />
          )}
          <Typography variant="caption" sx={{ fontSize: '0.65rem' }}>策略</Typography>
        </IconButton>

        {/* 中央加号 */}
        <Box
          onClick={handleAddClick}
          sx={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            bgcolor: '#333',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          }}
        >
          <AddIcon sx={{ fontSize: 32 }} />
        </Box>

        {/* 灵感 */}
        <IconButton
          onClick={() => setSelectedView('schedule')}
          sx={{ flexDirection: 'column', gap: 0.5, color: selectedView === 'schedule' ? '#333' : 'text.secondary' }}
        >
          {inspireIcon ? (
            <Box component="img" src={inspireIcon} sx={{ width: 24, height: 24 }} />
          ) : (
            <Box component="span" sx={{ fontSize: 24 }}>💡</Box>
          )}
          <Typography variant="caption" sx={{ fontSize: '0.65rem' }}>灵感</Typography>
        </IconButton>

        {/* 我的 */}
        <IconButton
          onClick={() => setSelectedView('settings')}
          sx={{ flexDirection: 'column', gap: 0.5, color: selectedView === 'settings' ? '#333' : 'text.secondary' }}
        >
          {profileIcon ? (
            <Box component="img" src={profileIcon} sx={{ width: 24, height: 24 }} />
          ) : (
            <Box component="span" sx={{ fontSize: 24 }}>😊</Box>
          )}
          <Typography variant="caption" sx={{ fontSize: '0.65rem' }}>我的</Typography>
        </IconButton>
      </Box>

      {/* 我的页面头部（仅设置视图） */}
      {selectedView === 'settings' && (
        <Box
          sx={{
            position: 'relative',
            zIndex: 1,
            bgcolor: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(10px)',
            borderBottom: '1px solid',
            borderColor: 'divider',
            backgroundImage: sidebarBackground ? `linear-gradient(rgba(255,255,255,0.9), rgba(255,255,255,0.9)), url(${sidebarBackground})` : 'none',
            backgroundSize: 'cover',
            p: 2,
          }}
        >
          {userAvatar || userName ? (
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar src={userAvatar} sx={{ width: 40, height: 40 }}>
                {userName.charAt(0)}
              </Avatar>
              <Box>
                <Typography variant="subtitle2" fontWeight={600}>
                  {userName || '用户'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  我的
                </Typography>
              </Box>
            </Stack>
          ) : (
            <Typography variant="h6" fontWeight={600}>
              我的
            </Typography>
          )}
        </Box>
      )}

      {/* 主要内容区域 */}
      <Box sx={{ flex: 1, overflowY: 'auto', pb: 9 }}>
        {selectedView === 'plan' && <MobileScheduleView />}
        {selectedView === 'schedule' && <InspirationView />}
        {selectedView === 'strategy' && <StrategySettings />}
        {selectedView === 'settings' && <AppSettings />}
      </Box>

      <InstallPrompt />
    </Box>
  );
}
