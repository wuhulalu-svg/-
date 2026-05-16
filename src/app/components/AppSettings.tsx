import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Stack,
  Button,
  Card,
  alpha,
  Tabs,
  Tab,
  Avatar,
  Slider,
  TextField,
  IconButton,
  Paper,
} from '@mui/material';
import {
  Person as PersonIcon,
  Palette as PaletteIcon,
  Wallpaper as WallpaperIcon,
  PhotoLibrary as PhotoLibraryIcon,
  Dashboard as DashboardIcon,
  CloudUpload as UploadIcon,
  Delete as DeleteIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
} from '@mui/icons-material';

type AppearanceType = 'app' | 'card' | 'sidebar' | 'login';

interface ImageSettings {
  url: string;
  scale: number;
  positionX: number;
  positionY: number;
}

export default function AppSettings() {
  const [activeTab, setActiveTab] = useState(0);
  const [userName, setUserName] = useState('');
  const [userAvatar, setUserAvatar] = useState('');
  const [selectedAppearance, setSelectedAppearance] = useState<AppearanceType | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [appBg, setAppBg] = useState<ImageSettings>({ url: '', scale: 100, positionX: 50, positionY: 50 });
  const [cardBg, setCardBg] = useState<ImageSettings>({ url: '', scale: 100, positionX: 50, positionY: 50 });
  const [sidebarBg, setSidebarBg] = useState<ImageSettings>({ url: '', scale: 100, positionX: 50, positionY: 50 });
  const [loginBg, setLoginBg] = useState<ImageSettings>({ url: '', scale: 100, positionX: 50, positionY: 50 });

  useEffect(() => {
    const savedName = localStorage.getItem('userName');
    const savedAvatar = localStorage.getItem('userAvatar');
    const savedAppBg = localStorage.getItem('appBackgroundSettings');
    const savedCardBg = localStorage.getItem('cardBackgroundSettings');
    const savedSidebarBg = localStorage.getItem('sidebarBackgroundSettings');
    const savedLoginBg = localStorage.getItem('loginBackgroundSettings');

    if (savedName) setUserName(savedName);
    if (savedAvatar) setUserAvatar(savedAvatar);
    if (savedAppBg) setAppBg(JSON.parse(savedAppBg));
    if (savedCardBg) setCardBg(JSON.parse(savedCardBg));
    if (savedSidebarBg) setSidebarBg(JSON.parse(savedSidebarBg));
    if (savedLoginBg) setLoginBg(JSON.parse(savedLoginBg));
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

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && selectedAppearance) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        updateImageSettings(selectedAppearance, { url: result, scale: 100, positionX: 50, positionY: 50 });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/') && selectedAppearance) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        updateImageSettings(selectedAppearance, { url: result, scale: 100, positionX: 50, positionY: 50 });
      };
      reader.readAsDataURL(file);
    }
  };

  const updateImageSettings = (type: AppearanceType, settings: ImageSettings) => {
    const storageKey = type === 'app' ? 'appBackgroundSettings' :
                       type === 'card' ? 'cardBackgroundSettings' :
                       type === 'sidebar' ? 'sidebarBackgroundSettings' :
                       'loginBackgroundSettings';

    if (type === 'app') {
      setAppBg(settings);
      localStorage.setItem('appBackgroundImage', settings.url);
    } else if (type === 'card') {
      setCardBg(settings);
      localStorage.setItem('cardBackgroundImage', settings.url);
    } else if (type === 'sidebar') {
      setSidebarBg(settings);
      localStorage.setItem('sidebarBackgroundImage', settings.url);
    } else {
      setLoginBg(settings);
      localStorage.setItem('loginBackgroundImage', settings.url);
    }

    localStorage.setItem(storageKey, JSON.stringify(settings));
    window.dispatchEvent(new Event('storage'));
  };

  const getCurrentSettings = () => {
    if (selectedAppearance === 'app') return appBg;
    if (selectedAppearance === 'card') return cardBg;
    if (selectedAppearance === 'sidebar') return sidebarBg;
    if (selectedAppearance === 'login') return loginBg;
    return { url: '', scale: 100, positionX: 50, positionY: 50 };
  };

  const deleteImage = () => {
    if (selectedAppearance) {
      updateImageSettings(selectedAppearance, { url: '', scale: 100, positionX: 50, positionY: 50 });
    }
  };

  const currentSettings = getCurrentSettings();

  return (
    <Box>
      <Paper elevation={2} sx={{ bgcolor: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)' }}>
        <Tabs
          value={activeTab}
          onChange={(_, val) => setActiveTab(val)}
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            '& .MuiTab-root': {
              textTransform: 'none',
              fontSize: '1rem',
              fontWeight: 600,
              minHeight: 64,
            },
          }}
        >
          <Tab icon={<PersonIcon />} iconPosition="start" label="个人资料" />
          <Tab icon={<PaletteIcon />} iconPosition="start" label="外观设置" />
        </Tabs>

        <Box sx={{ p: 4 }}>
          {/* Profile Tab */}
          {activeTab === 0 && (
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
          )}

          {/* Appearance Tab */}
          {activeTab === 1 && (
            <Box>
              {!selectedAppearance ? (
                <Stack spacing={3}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    选择要自定义的外观
                  </Typography>
                  <Stack direction="row" spacing={3}>
                    <Card
                      onClick={() => setSelectedAppearance('app')}
                      sx={{
                        flex: 1,
                        p: 3,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        border: '2px solid',
                        borderColor: 'divider',
                        '&:hover': {
                          borderColor: 'primary.main',
                          boxShadow: 4,
                          transform: 'translateY(-4px)',
                        },
                      }}
                    >
                      <Stack alignItems="center" spacing={2}>
                        <Box
                          sx={{
                            p: 2,
                            borderRadius: 2,
                            bgcolor: alpha('#6366f1', 0.1),
                          }}
                        >
                          <WallpaperIcon sx={{ fontSize: 48, color: 'primary.main' }} />
                        </Box>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          应用背景
                        </Typography>
                        <Typography variant="body2" color="text.secondary" align="center">
                          设置整体应用的背景图片
                        </Typography>
                      </Stack>
                    </Card>

                    <Card
                      onClick={() => setSelectedAppearance('card')}
                      sx={{
                        flex: 1,
                        p: 3,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        border: '2px solid',
                        borderColor: 'divider',
                        '&:hover': {
                          borderColor: 'primary.main',
                          boxShadow: 4,
                          transform: 'translateY(-4px)',
                        },
                      }}
                    >
                      <Stack alignItems="center" spacing={2}>
                        <Box
                          sx={{
                            p: 2,
                            borderRadius: 2,
                            bgcolor: alpha('#ec4899', 0.1),
                          }}
                        >
                          <PhotoLibraryIcon sx={{ fontSize: 48, color: '#ec4899' }} />
                        </Box>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          任务卡片背景
                        </Typography>
                        <Typography variant="body2" color="text.secondary" align="center">
                          设置日程任务卡片背景
                        </Typography>
                      </Stack>
                    </Card>

                    <Card
                      onClick={() => setSelectedAppearance('sidebar')}
                      sx={{
                        flex: 1,
                        p: 3,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        border: '2px solid',
                        borderColor: 'divider',
                        '&:hover': {
                          borderColor: 'primary.main',
                          boxShadow: 4,
                          transform: 'translateY(-4px)',
                        },
                      }}
                    >
                      <Stack alignItems="center" spacing={2}>
                        <Box
                          sx={{
                            p: 2,
                            borderRadius: 2,
                            bgcolor: alpha('#10b981', 0.1),
                          }}
                        >
                          <DashboardIcon sx={{ fontSize: 48, color: '#10b981' }} />
                        </Box>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          侧边栏背景
                        </Typography>
                        <Typography variant="body2" color="text.secondary" align="center">
                          设置左侧导航栏背景
                        </Typography>
                      </Stack>
                    </Card>
                  </Stack>

                  <Stack direction="row" spacing={3} sx={{ mt: 3 }}>
                    <Card
                      onClick={() => setSelectedAppearance('login')}
                      sx={{
                        flex: 1,
                        p: 3,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        border: '2px solid',
                        borderColor: 'divider',
                        '&:hover': {
                          borderColor: 'primary.main',
                          boxShadow: 4,
                          transform: 'translateY(-4px)',
                        },
                      }}
                    >
                      <Stack alignItems="center" spacing={2}>
                        <Box
                          sx={{
                            p: 2,
                            borderRadius: 2,
                            bgcolor: alpha('#f59e0b', 0.1),
                          }}
                        >
                          <WallpaperIcon sx={{ fontSize: 48, color: '#f59e0b' }} />
                        </Box>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          登录页背景
                        </Typography>
                        <Typography variant="body2" color="text.secondary" align="center">
                          设置登录注册页面背景
                        </Typography>
                      </Stack>
                    </Card>
                  </Stack>
                </Stack>
              ) : (
                <Stack spacing={3}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {selectedAppearance === 'app' ? '应用背景' :
                       selectedAppearance === 'card' ? '任务卡片背景' :
                       selectedAppearance === 'sidebar' ? '侧边栏背景' : '登录页背景'}
                    </Typography>
                    <Button
                      variant="outlined"
                      onClick={() => setSelectedAppearance(null)}
                      sx={{ textTransform: 'none' }}
                    >
                      返回
                    </Button>
                  </Stack>

                  {!currentSettings.url ? (
                    <Card
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      sx={{
                        p: 8,
                        textAlign: 'center',
                        border: '3px dashed',
                        borderColor: isDragging ? 'primary.main' : 'divider',
                        bgcolor: isDragging ? alpha('#6366f1', 0.05) : 'transparent',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                    >
                      <UploadIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                      <Typography variant="h6" gutterBottom>
                        拖拽图片到这里
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        或者点击下方按钮上传
                      </Typography>
                      <Button
                        variant="contained"
                        component="label"
                        startIcon={<UploadIcon />}
                        sx={{ textTransform: 'none' }}
                      >
                        选择图片
                        <input type="file" hidden accept="image/*" onChange={handleImageUpload} />
                      </Button>
                    </Card>
                  ) : (
                    <Stack spacing={3}>
                      <Card sx={{ p: 3, bgcolor: alpha('#000', 0.02) }}>
                        <Box
                          sx={{
                            width: '100%',
                            height: 300,
                            borderRadius: 2,
                            overflow: 'hidden',
                            position: 'relative',
                            bgcolor: '#f5f5f5',
                          }}
                        >
                          <Box
                            sx={{
                              width: '100%',
                              height: '100%',
                              backgroundImage: `url(${currentSettings.url})`,
                              backgroundSize: `${currentSettings.scale}%`,
                              backgroundPosition: `${currentSettings.positionX}% ${currentSettings.positionY}%`,
                              backgroundRepeat: 'no-repeat',
                            }}
                          />
                        </Box>
                      </Card>

                      <Card sx={{ p: 3 }}>
                        <Stack spacing={3}>
                          <Box>
                            <Stack direction="row" alignItems="center" spacing={2} mb={1}>
                              <ZoomOutIcon color="action" />
                              <Typography variant="body2" sx={{ minWidth: 60 }}>
                                缩放: {currentSettings.scale}%
                              </Typography>
                              <ZoomInIcon color="action" />
                            </Stack>
                            <Slider
                              value={currentSettings.scale}
                              onChange={(_, val) =>
                                updateImageSettings(selectedAppearance, {
                                  ...currentSettings,
                                  scale: val as number,
                                })
                              }
                              min={50}
                              max={200}
                              valueLabelDisplay="auto"
                            />
                          </Box>

                          <Box>
                            <Typography variant="body2" gutterBottom>
                              水平位置: {currentSettings.positionX}%
                            </Typography>
                            <Slider
                              value={currentSettings.positionX}
                              onChange={(_, val) =>
                                updateImageSettings(selectedAppearance, {
                                  ...currentSettings,
                                  positionX: val as number,
                                })
                              }
                              min={0}
                              max={100}
                              valueLabelDisplay="auto"
                            />
                          </Box>

                          <Box>
                            <Typography variant="body2" gutterBottom>
                              垂直位置: {currentSettings.positionY}%
                            </Typography>
                            <Slider
                              value={currentSettings.positionY}
                              onChange={(_, val) =>
                                updateImageSettings(selectedAppearance, {
                                  ...currentSettings,
                                  positionY: val as number,
                                })
                              }
                              min={0}
                              max={100}
                              valueLabelDisplay="auto"
                            />
                          </Box>
                        </Stack>
                      </Card>

                      <Stack direction="row" spacing={2}>
                        <Button
                          variant="outlined"
                          component="label"
                          startIcon={<UploadIcon />}
                          sx={{ textTransform: 'none', flex: 1 }}
                        >
                          更换图片
                          <input type="file" hidden accept="image/*" onChange={handleImageUpload} />
                        </Button>
                        <Button
                          variant="outlined"
                          color="error"
                          startIcon={<DeleteIcon />}
                          onClick={deleteImage}
                          sx={{ textTransform: 'none' }}
                        >
                          删除
                        </Button>
                      </Stack>
                    </Stack>
                  )}
                </Stack>
              )}
            </Box>
          )}
        </Box>
      </Paper>
    </Box>
  );
}
