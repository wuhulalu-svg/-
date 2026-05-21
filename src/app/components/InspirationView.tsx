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
  Tabs,
  Tab,
  Menu,
  MenuItem,
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Settings as SettingsIcon,
  MoreVert as MoreVertIcon,
  Close as CloseIcon,
  Lightbulb as LightbulbIcon,
} from '@mui/icons-material';

interface Item {
  id: string;
  content: string;
  completed: boolean;
  emoji?: string;
}

interface ListBox {
  id: string;
  name: string;
  items: Item[];
  color?: string;
}

export default function InspirationView() {
  const [boxes, setBoxes] = useState<ListBox[]>([
    { id: 'default', name: '未命名', items: [], color: '#6366f1' },
  ]);
  const [activeBoxId, setActiveBoxId] = useState('default');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [inspirationBgImage, setInspirationBgImage] = useState('');
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [renamingBoxId, setRenamingBoxId] = useState('');
  const [newBoxName, setNewBoxName] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuBoxId, setMenuBoxId] = useState('');

  useEffect(() => {
    const savedBoxes = localStorage.getItem('inspirationBoxes');
    const savedActiveId = localStorage.getItem('inspirationActiveBoxId');
    const savedBg = localStorage.getItem('inspirationBgImage');
    if (savedBoxes) setBoxes(JSON.parse(savedBoxes));
    if (savedActiveId) setActiveBoxId(savedActiveId);
    if (savedBg) setInspirationBgImage(savedBg);
  }, []);

  useEffect(() => {
    localStorage.setItem('inspirationBoxes', JSON.stringify(boxes));
  }, [boxes]);

  useEffect(() => {
    localStorage.setItem('inspirationActiveBoxId', activeBoxId);
  }, [activeBoxId]);

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

  const addNewBox = () => {
    const colors = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#8b5cf6'];
    const newId = Date.now().toString();
    const newBox: ListBox = {
      id: newId,
      name: '新灵感',
      items: [],
      color: colors[boxes.length % colors.length],
    };
    setBoxes([...boxes, newBox]);
    setActiveBoxId(newId);
  };

  const deleteBox = (boxId: string) => {
    if (boxes.length === 1) return;
    const newBoxes = boxes.filter(b => b.id !== boxId);
    setBoxes(newBoxes);
    if (activeBoxId === boxId) {
      setActiveBoxId(newBoxes[0].id);
    }
    setAnchorEl(null);
  };

  const openRenameDialog = (boxId: string) => {
    const box = boxes.find(b => b.id === boxId);
    if (box) {
      setRenamingBoxId(boxId);
      setNewBoxName(box.name);
      setRenameDialogOpen(true);
    }
    setAnchorEl(null);
  };

  const saveRename = () => {
    if (!newBoxName.trim()) return;
    setBoxes(boxes.map(b =>
      b.id === renamingBoxId ? { ...b, name: newBoxName.trim() } : b
    ));
    setRenameDialogOpen(false);
    setNewBoxName('');
  };

  const addItem = () => {
    setBoxes(boxes.map(box => {
      if (box.id === activeBoxId) {
        return {
          ...box,
          items: [...box.items, { id: Date.now().toString(), content: '', completed: false, emoji: '💡' }],
        };
      }
      return box;
    }));
  };

  const updateItem = (itemId: string, content: string) => {
    setBoxes(boxes.map(box => {
      if (box.id === activeBoxId) {
        return {
          ...box,
          items: box.items.map(item =>
            item.id === itemId ? { ...item, content } : item
          ),
        };
      }
      return box;
    }));
  };

  const toggleItem = (itemId: string) => {
    setBoxes(boxes.map(box => {
      if (box.id === activeBoxId) {
        return {
          ...box,
          items: box.items.map(item =>
            item.id === itemId ? { ...item, completed: !item.completed } : item
          ),
        };
      }
      return box;
    }));
  };

  const deleteItem = (itemId: string) => {
    setBoxes(boxes.map(box => {
      if (box.id === activeBoxId) {
        return {
          ...box,
          items: box.items.filter(item => item.id !== itemId),
        };
      }
      return box;
    }));
  };

  const activeBox = boxes.find(b => b.id === activeBoxId) || boxes[0];

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, boxId: string) => {
    setAnchorEl(event.currentTarget);
    setMenuBoxId(boxId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuBoxId('');
  };

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
      {/* 半透遮罩 */}
      {inspirationBgImage && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: 'rgba(255, 255, 255, 0.75)',
            backdropFilter: 'blur(2px)',
            zIndex: 0,
          }}
        />
      )}

      <Stack spacing={2} sx={{ position: 'relative', zIndex: 1 }}>
        {/* 头部：标题和设置按钮 */}
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Stack direction="row" alignItems="center" spacing={1}>
            <LightbulbIcon sx={{ fontSize: 28, color: 'primary.main' }} />
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              灵感收藏
            </Typography>
          </Stack>
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

        {/* 框框选项卡区域 - 改进样式 */}
        <Paper
          elevation={3}
          sx={{
            borderRadius: 4,
            overflow: 'hidden',
            bgcolor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            border: '1px solid',
            borderColor: alpha('#000', 0.06),
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', borderBottom: 1, borderColor: 'divider' }}>
            <Tabs
              value={activeBoxId}
              onChange={(_, val) => setActiveBoxId(val)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                flex: 1,
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  minHeight: 56,
                  py: 1,
                },
                '& .Mui-selected': {
                  color: 'primary.main',
                },
              }}
            >
              {boxes.map(box => (
                <Tab
                  key={box.id}
                  value={box.id}
                  label={
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          bgcolor: box.color || 'primary.main',
                        }}
                      />
                      <span>{box.name}</span>
                    </Stack>
                  }
                  sx={{
                    maxWidth: 'none',
                  }}
                />
              ))}
            </Tabs>
            <IconButton onClick={addNewBox} sx={{ mx: 1, color: 'primary.main' }}>
              <AddIcon />
            </IconButton>
          </Box>

          {/* 当前框框的操作栏 */}
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{
              px: 2,
              py: 2,
              bgcolor: alpha((activeBox.color || '#6366f1'), 0.05),
              borderBottom: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1}>
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  bgcolor: activeBox.color || 'primary.main',
                }}
              />
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                {activeBox.name}
              </Typography>
              <Chip
                label={`${activeBox.items.length} 项`}
                size="small"
                variant="outlined"
                sx={{ ml: 1 }}
              />
            </Stack>
            <Stack direction="row" spacing={1}>
              <IconButton size="small" onClick={() => openRenameDialog(activeBoxId)}>
                <EditIcon fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                onClick={(e) => handleMenuOpen(e, activeBoxId)}
                disabled={boxes.length === 1}
              >
                <DeleteIcon fontSize="small" color={boxes.length === 1 ? 'disabled' : 'error'} />
              </IconButton>
            </Stack>
          </Stack>

          {/* 待办列表区域 */}
          <Box sx={{ p: 2 }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={addItem}
              fullWidth
              sx={{
                mb: 2,
                borderRadius: 40,
                textTransform: 'none',
                bgcolor: activeBox.color || 'primary.main',
                '&:hover': {
                  bgcolor: alpha((activeBox.color || 'primary.main'), 0.8),
                  boxShadow: 2,
                },
              }}
            >
              添加灵感
            </Button>

            <Stack spacing={1.5}>
              {activeBox.items.length > 0 ? (
                activeBox.items.map((item) => (
                  <Paper
                    key={item.id}
                    elevation={0}
                    sx={{
                      p: 2,
                      borderRadius: 3,
                      bgcolor: item.completed ? alpha('#4CAF50', 0.08) : 'rgba(255, 255, 255, 0.6)',
                      border: '1px solid',
                      borderColor: item.completed ? alpha('#4CAF50', 0.3) : alpha('#000', 0.08),
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        boxShadow: 2,
                        borderColor: activeBox.color || 'primary.main',
                        transform: 'translateY(-2px)',
                      },
                    }}
                  >
                    <Stack direction="row" spacing={1.5} alignItems="flex-start">
                      <Checkbox
                        checked={item.completed}
                        onChange={() => toggleItem(item.id)}
                        size="medium"
                        sx={{
                          color: activeBox.color || 'primary.main',
                          '&.Mui-checked': {
                            color: activeBox.color || 'primary.main',
                          },
                          mt: 0.5,
                        }}
                      />
                      <Box sx={{ flex: 1, pt: 0.5 }}>
                        <TextField
                          fullWidth
                          value={item.content}
                          onChange={(e) => updateItem(item.id, e.target.value)}
                          placeholder="输入灵感内容..."
                          variant="standard"
                          size="small"
                          multiline
                          maxRows={4}
                          sx={{
                            '& .MuiInput-root': {
                              fontSize: '0.95rem',
                              textDecoration: item.completed ? 'line-through' : 'none',
                              opacity: item.completed ? 0.6 : 1,
                              fontWeight: 500,
                            },
                            '& .MuiInput-root:before, & .MuiInput-root:after': {
                              borderBottom: 'none',
                            },
                          }}
                        />
                      </Box>
                      <IconButton
                        size="small"
                        onClick={() => deleteItem(item.id)}
                        sx={{
                          color: 'error.main',
                          '&:hover': {
                            bgcolor: alpha('#f44336', 0.1),
                          },
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  </Paper>
                ))
              ) : (
                <Box
                  sx={{
                    py: 6,
                    textAlign: 'center',
                    borderRadius: 3,
                    bgcolor: 'rgba(0,0,0,0.02)',
                    border: '2px dashed',
                    borderColor: 'divider',
                  }}
                >
                  <LightbulbIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    暂无灵感，点击上方按钮添加
                  </Typography>
                </Box>
              )}
            </Stack>
          </Box>
        </Paper>
      </Stack>

      {/* 重命名对话框 */}
      <Dialog open={renameDialogOpen} onClose={() => setRenameDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogContent sx={{ pt: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
            重命名灵感库
          </Typography>
          <TextField
            fullWidth
            label="名称"
            value={newBoxName}
            onChange={(e) => setNewBoxName(e.target.value)}
            autoFocus
          />
        </DialogContent>
        <DialogActions sx={{ pb: 3, px: 3 }}>
          <Button onClick={() => setRenameDialogOpen(false)} sx={{ textTransform: 'none' }}>
            取消
          </Button>
          <Button onClick={saveRename} variant="contained" disabled={!newBoxName.trim()} sx={{ textTransform: 'none' }}>
            保存
          </Button>
        </DialogActions>
      </Dialog>

      {/* 删除确认菜单 */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem
          onClick={() => {
            deleteBox(menuBoxId);
            handleMenuClose();
          }}
          sx={{ color: 'error.main' }}
        >
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} /> 删除此灵感库
        </MenuItem>
      </Menu>

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
