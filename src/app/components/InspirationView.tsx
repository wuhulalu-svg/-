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
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Settings as SettingsIcon,
  Info as InfoIcon,
} from '@mui/icons-material';

interface Item {
  id: string;
  content: string;
  completed: boolean;
}

interface ListBox {
  id: string;
  name: string;
  items: Item[];
}

export default function InspirationView() {
  const [boxes, setBoxes] = useState<ListBox[]>([
    { id: 'default', name: '未命名', items: [] },
  ]);
  const [activeBoxId, setActiveBoxId] = useState('default');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [inspirationBgImage, setInspirationBgImage] = useState('');
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [renamingBoxId, setRenamingBoxId] = useState('');
  const [newBoxName, setNewBoxName] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuBoxId, setMenuBoxId] = useState('');
  const [infoDialogOpen, setInfoDialogOpen] = useState(false);

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

  // 监听底部加号事件
  useEffect(() => {
    const handleAddItem = () => addItemToActiveBox();
    window.addEventListener('openAddInspirationItem', handleAddItem);
    return () => window.removeEventListener('openAddInspirationItem', handleAddItem);
  }, [activeBoxId, boxes]);

  const addItemToActiveBox = () => {
    setBoxes((prev) =>
      prev.map((box) =>
        box.id === activeBoxId
          ? { ...box, items: [...box.items, { id: Date.now().toString(), content: '', completed: false }] }
          : box
      )
    );
  };

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
    const newId = Date.now().toString();
    const newBox: ListBox = { id: newId, name: '未命名', items: [] };
    setBoxes([...boxes, newBox]);
    setActiveBoxId(newId);
  };

  const deleteBox = (boxId: string) => {
    if (boxes.length === 1) return;
    const newBoxes = boxes.filter((b) => b.id !== boxId);
    setBoxes(newBoxes);
    if (activeBoxId === boxId) setActiveBoxId(newBoxes[0].id);
    setAnchorEl(null);
  };

  const openRenameDialog = (boxId: string) => {
    const box = boxes.find((b) => b.id === boxId);
    if (box) {
      setRenamingBoxId(boxId);
      setNewBoxName(box.name);
      setRenameDialogOpen(true);
    }
    setAnchorEl(null);
  };

  const saveRename = () => {
    if (!newBoxName.trim()) return;
    setBoxes((prev) =>
      prev.map((b) => (b.id === renamingBoxId ? { ...b, name: newBoxName.trim() } : b))
    );
    setRenameDialogOpen(false);
    setNewBoxName('');
  };

  const updateItem = (itemId: string, content: string) => {
    setBoxes((prev) =>
      prev.map((box) =>
        box.id === activeBoxId
          ? { ...box, items: box.items.map((item) => (item.id === itemId ? { ...item, content } : item)) }
          : box
      )
    );
  };

  const toggleItem = (itemId: string) => {
    setBoxes((prev) =>
      prev.map((box) =>
        box.id === activeBoxId
          ? {
              ...box,
              items: box.items.map((item) =>
                item.id === itemId ? { ...item, completed: !item.completed } : item
              ),
            }
          : box
      )
    );
  };

  const deleteItem = (itemId: string) => {
    setBoxes((prev) =>
      prev.map((box) =>
        box.id === activeBoxId
          ? { ...box, items: box.items.filter((item) => item.id !== itemId) }
          : box
      )
    );
  };

  const activeBox = boxes.find((b) => b.id === activeBoxId) || boxes[0];

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
        p: 1.5,
        backgroundImage: inspirationBgImage ? `url(${inspirationBgImage})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
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

      <Stack spacing={1.5} sx={{ position: 'relative', zIndex: 1 }}>
        {/* 右上角按钮组 */}
        <Stack direction="row" justifyContent="flex-end" spacing={1}>
          <IconButton
            size="small"
            onClick={() => setInfoDialogOpen(true)}
            sx={{ bgcolor: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(8px)', boxShadow: 1, '&:hover': { bgcolor: 'white' } }}
          >
            <InfoIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => setSettingsOpen(true)}
            sx={{ bgcolor: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(8px)', boxShadow: 1, '&:hover': { bgcolor: 'white' } }}
          >
            <SettingsIcon fontSize="small" />
          </IconButton>
        </Stack>

        {/* 框框选项卡区域 */}
        <Paper
          elevation={1}
          sx={{
            borderRadius: 3,
            overflow: 'hidden',
            bgcolor: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', borderBottom: 1, borderColor: 'divider' }}>
            <Tabs
              value={activeBoxId}
              onChange={(_, val) => setActiveBoxId(val)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{ flex: 1, minHeight: 40, '& .MuiTab-root': { textTransform: 'none', fontWeight: 500, fontSize: '0.8rem', minHeight: 40, py: 1 } }}
            >
              {boxes.map((box) => (
                <Tab key={box.id} value={box.id} label={box.name} />
              ))}
            </Tabs>
            <IconButton onClick={addNewBox} size="small" sx={{ mx: 0.5 }}>
              <AddIcon fontSize="small" />
            </IconButton>
          </Box>

          {/* 当前框框的操作栏 */}
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 1.5, py: 1, bgcolor: 'rgba(0,0,0,0.02)' }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {activeBox.name}
            </Typography>
            <Stack direction="row" spacing={0.5}>
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

          {/* 待办列表区域（无独立添加按钮） */}
          <Box sx={{ p: 1.5 }}>
            <Stack spacing={1}>
              {activeBox.items.length > 0 ? (
                activeBox.items.map((item) => (
                  <Paper
                    key={item.id}
                    elevation={0}
                    sx={{ p: 1, borderRadius: 2, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}
                  >
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <Checkbox checked={item.completed} onChange={() => toggleItem(item.id)} size="small" sx={{ p: 0.5 }} />
                      <TextField
                        fullWidth
                        value={item.content}
                        onChange={(e) => updateItem(item.id, e.target.value)}
                        placeholder="输入内容..."
                        variant="standard"
                        size="small"
                        sx={{
                          '& .MuiInput-root': {
                            fontSize: '0.85rem',
                            textDecoration: item.completed ? 'line-through' : 'none',
                            opacity: item.completed ? 0.6 : 1,
                          },
                          '& .MuiInput-root:before, & .MuiInput-root:after': { borderBottom: 'none' },
                        }}
                      />
                      <IconButton size="small" onClick={() => deleteItem(item.id)} sx={{ p: 0.5 }}>
                        <DeleteIcon fontSize="small" color="error" />
                      </IconButton>
                    </Stack>
                  </Paper>
                ))
              ) : (
                <Box sx={{ py: 4, textAlign: 'center', borderRadius: 2, bgcolor: 'rgba(0,0,0,0.02)', border: '1px dashed', borderColor: 'divider' }}>
                  <Typography variant="caption" color="text.secondary">
                    暂无待办项，点击底部加号添加
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
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>重命名框框</Typography>
          <TextField fullWidth label="名称" value={newBoxName} onChange={(e) => setNewBoxName(e.target.value)} autoFocus />
        </DialogContent>
        <DialogActions sx={{ pb: 3, px: 3 }}>
          <Button onClick={() => setRenameDialogOpen(false)} sx={{ textTransform: 'none' }}>取消</Button>
          <Button onClick={saveRename} variant="contained" disabled={!newBoxName.trim()} sx={{ textTransform: 'none' }}>保存</Button>
        </DialogActions>
      </Dialog>

      {/* 删除菜单 */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={() => { deleteBox(menuBoxId); handleMenuClose(); }} sx={{ color: 'error.main' }}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} /> 删除此框框
        </MenuItem>
      </Menu>

      {/* 功能介绍弹窗 */}
      <Dialog open={infoDialogOpen} onClose={() => setInfoDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogContent sx={{ pt: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>💡 灵感是什么？</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
            灵感就是记录你脑海中一闪而过的想法、想尝试的事物、怕忘记的点子。
            <br /><br />
            比如：
            <br />
            • 我想试着做一道辣椒炒肉
            <br />
            • 周末去爬山的计划
            <br />
            • 一个有趣的短视频创意
            <br /><br />
            把灵感记在这里，避免遗忘，以后可以随时查看和执行。
          </Typography>
        </DialogContent>
        <DialogActions sx={{ pb: 3, px: 3 }}>
          <Button onClick={() => setInfoDialogOpen(false)} variant="contained" sx={{ textTransform: 'none' }}>明白啦</Button>
        </DialogActions>
      </Dialog>

      {/* 背景设置弹窗 */}
      <Dialog open={settingsOpen} onClose={() => setSettingsOpen(false)} fullWidth maxWidth="sm">
        <DialogContent sx={{ pt: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>🎨 背景设置</Typography>
          <Stack spacing={3}>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5 }}>灵感列表背景图片</Typography>
              <Button variant="outlined" component="label" fullWidth startIcon={<AddIcon />} sx={{ textTransform: 'none', borderRadius: 40 }}>
                {inspirationBgImage ? '更换图片' : '上传图片'}
                <input type="file" hidden accept="image/*" onChange={handleBgUpload} />
              </Button>
              {inspirationBgImage && (
                <Box sx={{ mt: 2, height: 100, borderRadius: 2, backgroundImage: `url(${inspirationBgImage})`, backgroundSize: 'cover', backgroundPosition: 'center', border: '1px solid #e0e0e0' }} />
              )}
            </Box>
            <Button variant="contained" onClick={() => setSettingsOpen(false)} sx={{ textTransform: 'none', borderRadius: 40 }}>完成</Button>
          </Stack>
        </DialogContent>
      </Dialog>
    </Box>
  );
}
