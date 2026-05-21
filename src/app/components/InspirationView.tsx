import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Stack,
  TextField,
  IconButton,
  Card,
  Checkbox,
  Button,
  Dialog,
  DialogContent,
  DialogActions,
  alpha,
  Paper,
  Fade,
  Grow,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Settings as SettingsIcon,
  ShoppingCart as ShoppingIcon,
  Kitchen as KitchenIcon,
  Assignment as TodoIcon,
  AutoAwesome as SparklesIcon,
} from '@mui/icons-material';

interface Item {
  id: string;
  content: string;
  completed: boolean;
}

interface ListSection {
  id: string;
  name: string;
  items: Item[];
  editable: boolean;
  icon: React.ReactNode;
}

export default function InspirationView() {
  const [sections, setSections] = useState<ListSection[]>([
    { 
      id: '1', 
      name: '要购买的东西', 
      items: [], 
      editable: false,
      icon: <ShoppingIcon sx={{ fontSize: 28 }} /> 
    },
    { 
      id: '2', 
      name: '想要做的菜', 
      items: [], 
      editable: false,
      icon: <KitchenIcon sx={{ fontSize: 28 }} /> 
    },
    { 
      id: '3', 
      name: '待办事项', 
      items: [], 
      editable: true,
      icon: <TodoIcon sx={{ fontSize: 28 }} /> 
    },
  ]);

  const [editNameDialog, setEditNameDialog] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [editingSectionId, setEditingSectionId] = useState('');
  const [newSectionName, setNewSectionName] = useState('');
  const [inspirationBgImage, setInspirationBgImage] = useState('');

  // 加载保存的数据
  useEffect(() => {
    const saved = localStorage.getItem('inspirationSections');
    const savedBg = localStorage.getItem('inspirationBgImage');
    if (saved) {
      const parsed = JSON.parse(saved);
      // 合并图标，防止丢失
      const merged = parsed.map((sec: any, idx: number) => ({
        ...sec,
        icon: sections[idx]?.icon || <SparklesIcon />,
      }));
      setSections(merged);
    }
    if (savedBg) setInspirationBgImage(savedBg);
  }, []);

  useEffect(() => {
    localStorage.setItem('inspirationSections', JSON.stringify(sections));
  }, [sections]);

  const handleBgUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setInspirationBgImage(result);
        localStorage.setItem('inspirationBgImage', result);
      };
      reader.readAsDataURL(file);
    }
  };

  const addItem = (sectionId: string) => {
    setSections(sections.map(section => {
      if (section.id === sectionId) {
        return {
          ...section,
          items: [...section.items, { id: Date.now().toString(), content: '', completed: false }],
        };
      }
      return section;
    }));
  };

  const updateItem = (sectionId: string, itemId: string, content: string) => {
    setSections(sections.map(section => {
      if (section.id === sectionId) {
        return {
          ...section,
          items: section.items.map(item =>
            item.id === itemId ? { ...item, content } : item
          ),
        };
      }
      return section;
    }));
  };

  const toggleItem = (sectionId: string, itemId: string) => {
    setSections(sections.map(section => {
      if (section.id === sectionId) {
        return {
          ...section,
          items: section.items.map(item =>
            item.id === itemId ? { ...item, completed: !item.completed } : item
          ),
        };
      }
      return section;
    }));
  };

  const deleteItem = (sectionId: string, itemId: string) => {
    setSections(sections.map(section => {
      if (section.id === sectionId) {
        return {
          ...section,
          items: section.items.filter(item => item.id !== itemId),
        };
      }
      return section;
    }));
  };

  const openEditNameDialog = (sectionId: string) => {
    const section = sections.find(s => s.id === sectionId);
    if (section?.editable) {
      setEditingSectionId(sectionId);
      setNewSectionName(section.name);
      setEditNameDialog(true);
    }
  };

  const saveSectionName = () => {
    setSections(sections.map(section =>
      section.id === editingSectionId
        ? { ...section, name: newSectionName }
        : section
    ));
    setEditNameDialog(false);
  };

  // 每个卡片独立的配色（柔和）
  const cardColors = [
    { gradient: 'linear-gradient(135deg, #fff5f0 0%, #ffe9e0 100%)', accent: '#FF8A65', borderLight: '#FFBBA0' },
    { gradient: 'linear-gradient(135deg, #f0f9f0 0%, #e0f5e0 100%)', accent: '#66BB6A', borderLight: '#A5D6A7' },
    { gradient: 'linear-gradient(135deg, #f0f4ff 0%, #e3e9ff 100%)', accent: '#7986CB', borderLight: '#B2C2FF' },
  ];

  return (
    <Box
      sx={{
        minHeight: '100%',
        p: 2,
        backgroundImage: inspirationBgImage ? `url(${inspirationBgImage})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* 浮层遮罩（增强背景可读性） */}
      {inspirationBgImage && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: 'rgba(255, 255, 255, 0.6)',
            backdropFilter: 'blur(2px)',
            zIndex: 0,
          }}
        />
      )}

      <Stack spacing={3} sx={{ position: 'relative', zIndex: 1 }}>
        {/* 头部设置按钮 */}
        <Stack direction="row" justifyContent="flex-end">
          <IconButton
            onClick={() => setSettingsOpen(true)}
            sx={{
              bgcolor: 'rgba(255,255,255,0.8)',
              backdropFilter: 'blur(8px)',
              boxShadow: 1,
              '&:hover': { bgcolor: 'white' },
            }}
          >
            <SettingsIcon />
          </IconButton>
        </Stack>

        {sections.map((section, idx) => (
          <Grow in timeout={300 * idx} key={section.id}>
            <Card
              sx={{
                borderRadius: 5,
                overflow: 'hidden',
                background: cardColors[idx % cardColors.length].gradient,
                border: `1px solid ${cardColors[idx % cardColors.length].borderLight}`,
                boxShadow: '0 8px 20px rgba(0,0,0,0.05)',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 16px 30px rgba(0,0,0,0.1)',
                },
              }}
            >
              {/* 卡片头部 */}
              <Box
                sx={{
                  px: 3,
                  py: 2,
                  borderBottom: `2px solid ${cardColors[idx % cardColors.length].accent}20`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Box
                    sx={{
                      p: 1,
                      borderRadius: '50%',
                      bgcolor: `${cardColors[idx % cardColors.length].accent}20`,
                      color: cardColors[idx % cardColors.length].accent,
                    }}
                  >
                    {section.icon}
                  </Box>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 700,
                      letterSpacing: -0.5,
                      background: `linear-gradient(135deg, ${cardColors[idx % cardColors.length].accent}, #2c3e50)`,
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      color: 'transparent',
                    }}
                  >
                    {section.name}
                  </Typography>
                  {section.editable && (
                    <IconButton
                      size="small"
                      onClick={() => openEditNameDialog(section.id)}
                      sx={{ color: cardColors[idx % cardColors.length].accent }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  )}
                </Stack>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => addItem(section.id)}
                  sx={{
                    textTransform: 'none',
                    borderRadius: 40,
                    bgcolor: cardColors[idx % cardColors.length].accent,
                    boxShadow: 'none',
                    '&:hover': {
                      bgcolor: cardColors[idx % cardColors.length].accent,
                      filter: 'brightness(0.95)',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                    },
                  }}
                >
                  添加
                </Button>
              </Box>

              {/* 列表项 */}
              <Box sx={{ p: 2 }}>
                <Stack spacing={1.5}>
                  {section.items.length > 0 ? (
                    section.items.map((item) => (
                      <Paper
                        key={item.id}
                        elevation={0}
                        sx={{
                          p: 1.5,
                          borderRadius: 3,
                          bgcolor: 'rgba(255,255,255,0.7)',
                          backdropFilter: 'blur(4px)',
                          transition: 'all 0.2s',
                          '&:hover': {
                            bgcolor: 'white',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                            '& .delete-btn': { opacity: 1 },
                          },
                        }}
                      >
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Checkbox
                            checked={item.completed}
                            onChange={() => toggleItem(section.id, item.id)}
                            size="medium"
                            sx={{
                              color: cardColors[idx % cardColors.length].accent,
                              '&.Mui-checked': {
                                color: cardColors[idx % cardColors.length].accent,
                              },
                            }}
                          />
                          <TextField
                            fullWidth
                            value={item.content}
                            onChange={(e) => updateItem(section.id, item.id, e.target.value)}
                            placeholder="写点什么..."
                            variant="standard"
                            size="small"
                            sx={{
                              '& .MuiInput-root': {
                                fontSize: '1rem',
                                textDecoration: item.completed ? 'line-through' : 'none',
                                opacity: item.completed ? 0.6 : 1,
                                fontWeight: item.completed ? 400 : 500,
                              },
                              '& .MuiInput-root:before, & .MuiInput-root:after': {
                                borderBottom: 'none',
                              },
                            }}
                          />
                          <IconButton
                            className="delete-btn"
                            size="small"
                            onClick={() => deleteItem(section.id, item.id)}
                            sx={{
                              opacity: { xs: 1, sm: 0 },
                              transition: 'opacity 0.2s',
                              color: '#f06292',
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Stack>
                      </Paper>
                    ))
                  ) : (
                    <Fade in>
                      <Box
                        sx={{
                          py: 6,
                          textAlign: 'center',
                          borderRadius: 3,
                          bgcolor: 'rgba(255,255,255,0.5)',
                          border: '1px dashed',
                          borderColor: 'divider',
                        }}
                      >
                        <SparklesIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1, opacity: 0.5 }} />
                        <Typography variant="body2" color="text.secondary">
                          暂无内容，点击“添加”开始记录灵感
                        </Typography>
                      </Box>
                    </Fade>
                  )}
                </Stack>
              </Box>
            </Card>
          </Grow>
        ))}
      </Stack>

      {/* 编辑名称弹窗 */}
      <Dialog open={editNameDialog} onClose={() => setEditNameDialog(false)} maxWidth="sm" fullWidth>
        <DialogContent sx={{ pt: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
            修改列表名称
          </Typography>
          <TextField
            fullWidth
            label="列表名称"
            value={newSectionName}
            onChange={(e) => setNewSectionName(e.target.value)}
            autoFocus
          />
        </DialogContent>
        <DialogActions sx={{ pb: 3, px: 3 }}>
          <Button onClick={() => setEditNameDialog(false)} sx={{ textTransform: 'none' }}>
            取消
          </Button>
          <Button
            onClick={saveSectionName}
            variant="contained"
            disabled={!newSectionName.trim()}
            sx={{ textTransform: 'none' }}
          >
            保存
          </Button>
        </DialogActions>
      </Dialog>

      {/* 背景设置弹窗 */}
      <Dialog open={settingsOpen} onClose={() => setSettingsOpen(false)} fullWidth maxWidth="sm">
        <DialogContent sx={{ pt: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
            🎨 背景设置
          </Typography>
          <Stack spacing={3}>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5 }}>
                灵感列表背景图片
              </Typography>
              <Button
                variant="outlined"
                component="label"
                fullWidth
                startIcon={<AddIcon />}
                sx={{ textTransform: 'none', borderRadius: 40 }}
              >
                {inspirationBgImage ? '更换图片' : '上传图片'}
                <input type="file" hidden accept="image/*" onChange={handleBgUpload} />
              </Button>
              {inspirationBgImage && (
                <Box
                  sx={{
                    mt: 2,
                    height: 120,
                    borderRadius: 3,
                    backgroundImage: `url(${inspirationBgImage})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    border: '1px solid #e0e0e0',
                  }}
                />
              )}
            </Box>
            <Button
              variant="contained"
              onClick={() => setSettingsOpen(false)}
              sx={{ textTransform: 'none', borderRadius: 40 }}
            >
              完成
            </Button>
          </Stack>
        </DialogContent>
      </Dialog>
    </Box>
  );
}
