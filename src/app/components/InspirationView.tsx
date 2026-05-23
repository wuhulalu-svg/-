import { useState, useEffect } from 'react';
import {
  Box, Typography, Stack, IconButton, Paper, Tabs, Tab, TextField, Checkbox,
  Button, Dialog, DialogContent, DialogActions, Slider, alpha, Menu, MenuItem,
} from '@mui/material';
import {
  Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon,
  Settings as SettingsIcon, Info as InfoIcon,
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
  const [boxes, setBoxes] = useState<ListBox[]>([{ id: 'default', name: '未命名', items: [] }]);
  const [activeBoxId, setActiveBoxId] = useState('default');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [renamingBoxId, setRenamingBoxId] = useState('');
  const [newBoxName, setNewBoxName] = useState('');
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [menuBoxId, setMenuBoxId] = useState('');
  const [bgSettings, setBgSettings] = useState({ url: '', scale: 100, posX: 50, posY: 50 });

  useEffect(() => {
    const savedBoxes = localStorage.getItem('inspirationBoxes');
    const savedActive = localStorage.getItem('inspirationActiveBoxId');
    const savedBg = localStorage.getItem('inspirationBgSettings');
    if (savedBoxes) setBoxes(JSON.parse(savedBoxes));
    if (savedActive) setActiveBoxId(savedActive);
    if (savedBg) setBgSettings(JSON.parse(savedBg));
  }, []);

  useEffect(() => {
    localStorage.setItem('inspirationBoxes', JSON.stringify(boxes));
  }, [boxes]);
  useEffect(() => {
    localStorage.setItem('inspirationActiveBoxId', activeBoxId);
  }, [activeBoxId]);

  const activeBox = boxes.find(b => b.id === activeBoxId) || boxes[0];

  const addItem = () => {
    setBoxes(prev => prev.map(box => box.id === activeBoxId ? { ...box, items: [...box.items, { id: Date.now().toString(), content: '', completed: false }] } : box));
  };
  const updateItem = (itemId: string, content: string) => {
    setBoxes(prev => prev.map(box => box.id === activeBoxId ? { ...box, items: box.items.map(item => item.id === itemId ? { ...item, content } : item) } : box));
  };
  const toggleItem = (itemId: string) => {
    setBoxes(prev => prev.map(box => box.id === activeBoxId ? { ...box, items: box.items.map(item => item.id === itemId ? { ...item, completed: !item.completed } : item) } : box));
  };
  const deleteItem = (itemId: string) => {
    setBoxes(prev => prev.map(box => box.id === activeBoxId ? { ...box, items: box.items.filter(item => item.id !== itemId) } : box));
  };
  const addNewBox = () => {
    const newId = Date.now().toString();
    setBoxes([...boxes, { id: newId, name: '未命名', items: [] }]);
    setActiveBoxId(newId);
  };
  const renameBox = (id: string, newName: string) => {
    setBoxes(prev => prev.map(b => b.id === id ? { ...b, name: newName } : b));
  };
  const deleteBox = (id: string) => {
    if (boxes.length === 1) return;
    const newBoxes = boxes.filter(b => b.id !== id);
    setBoxes(newBoxes);
    if (activeBoxId === id) setActiveBoxId(newBoxes[0].id);
  };

  const handleBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const url = ev.target?.result as string;
      const newSettings = { url, scale: 100, posX: 50, posY: 50 };
      setBgSettings(newSettings);
      localStorage.setItem('inspirationBgSettings', JSON.stringify(newSettings));
    };
    reader.readAsDataURL(file);
  };
  const updateBgSetting = (key: string, val: number) => {
    const newSettings = { ...bgSettings, [key]: val };
    setBgSettings(newSettings);
    localStorage.setItem('inspirationBgSettings', JSON.stringify(newSettings));
  };

  const handleMenuOpen = (e: React.MouseEvent<HTMLElement>, boxId: string) => {
    setMenuAnchor(e.currentTarget);
    setMenuBoxId(boxId);
  };
  const handleMenuClose = () => {
    setMenuAnchor(null);
    setMenuBoxId('');
  };

  // 监听底部加号事件
  useEffect(() => {
    const handler = () => addItem();
    window.addEventListener('openAddInspirationItem', handler);
    return () => window.removeEventListener('openAddInspirationItem', handler);
  }, [activeBoxId]);

  return (
    <Box sx={{
      minHeight: '100%', p: 1.5,
      backgroundImage: bgSettings.url ? `url(${bgSettings.url})` : 'none',
      backgroundSize: `${bgSettings.scale}%`,
      backgroundPosition: `${bgSettings.posX}% ${bgSettings.posY}%`,
      backgroundAttachment: 'fixed',
    }}>
      {bgSettings.url && <Box sx={{ position: 'fixed', inset: 0, bgcolor: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(2px)', zIndex: 0 }} />}

      <Stack spacing={1.5} sx={{ position: 'relative', zIndex: 1 }}>
        <Stack direction="row" justifyContent="flex-end" spacing={1}>
          <IconButton size="small" onClick={() => setInfoOpen(true)} sx={{ bgcolor: 'rgba(255,255,255,0.8)', boxShadow: 1 }}><InfoIcon fontSize="small" /></IconButton>
          <IconButton size="small" onClick={() => setSettingsOpen(true)} sx={{ bgcolor: 'rgba(255,255,255,0.8)', boxShadow: 1 }}><SettingsIcon fontSize="small" /></IconButton>
        </Stack>

        <Paper sx={{ borderRadius: 3, overflow: 'hidden', bgcolor: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={activeBoxId} onChange={(_, v) => setActiveBoxId(v)} variant="scrollable" scrollButtons="auto" sx={{ flex: 1, minHeight: 40 }}>
              {boxes.map(box => <Tab key={box.id} value={box.id} label={box.name} sx={{ minHeight: 40, fontSize: '0.8rem' }} />)}
            </Tabs>
            <IconButton onClick={addNewBox} size="small"><AddIcon fontSize="small" /></IconButton>
          </Box>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 1.5, py: 1, bgcolor: 'rgba(0,0,0,0.02)' }}>
            <Typography variant="body2" fontWeight={600}>{activeBox.name}</Typography>
            <Stack direction="row" spacing={0.5}>
              <IconButton size="small" onClick={() => { setRenamingBoxId(activeBoxId); setNewBoxName(activeBox.name); setRenameDialogOpen(true); }}><EditIcon fontSize="small" /></IconButton>
              <IconButton size="small" onClick={(e) => handleMenuOpen(e, activeBoxId)} disabled={boxes.length === 1}><DeleteIcon fontSize="small" color={boxes.length === 1 ? 'disabled' : 'error'} /></IconButton>
            </Stack>
          </Stack>
          <Box sx={{ p: 1.5 }}>
            <Stack spacing={1}>
              {activeBox.items.map(item => (
                <Paper key={item.id} sx={{ p: 1, border: '1px solid', borderColor: 'divider' }}>
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <Checkbox checked={item.completed} onChange={() => toggleItem(item.id)} size="small" />
                    <TextField value={item.content} onChange={e => updateItem(item.id, e.target.value)} placeholder="输入内容..." variant="standard" fullWidth size="small" sx={{ '& .MuiInput-root:before, &:after': { borderBottom: 'none' } }} />
                    <IconButton size="small" onClick={() => deleteItem(item.id)}><DeleteIcon fontSize="small" color="error" /></IconButton>
                  </Stack>
                </Paper>
              ))}
              {activeBox.items.length === 0 && <Box sx={{ py: 4, textAlign: 'center', color: 'text.secondary' }}>暂无待办，点击底部加号添加</Box>}
            </Stack>
          </Box>
        </Paper>
      </Stack>

      {/* 重命名对话框 */}
      <Dialog open={renameDialogOpen} onClose={() => setRenameDialogOpen(false)}>
        <DialogContent><TextField label="新名称" value={newBoxName} onChange={e => setNewBoxName(e.target.value)} fullWidth autoFocus /></DialogContent>
        <DialogActions><Button onClick={() => setRenameDialogOpen(false)}>取消</Button><Button onClick={() => { renameBox(renamingBoxId, newBoxName); setRenameDialogOpen(false); }} variant="contained">保存</Button></DialogActions>
      </Dialog>

      {/* 删除菜单 */}
      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={handleMenuClose}>
        <MenuItem onClick={() => { deleteBox(menuBoxId); handleMenuClose(); }} sx={{ color: 'error.main' }}>删除此框框</MenuItem>
      </Menu>

      {/* 背景设置 */}
      <Dialog open={settingsOpen} onClose={() => setSettingsOpen(false)} maxWidth="sm" fullWidth>
        <DialogContent>
          <Typography variant="h6" fontWeight={700} mb={2}>🎨 背景设置</Typography>
          <Button variant="outlined" component="label" fullWidth>{bgSettings.url ? '更换图片' : '上传图片'}<input type="file" hidden accept="image/*" onChange={handleBgUpload} /></Button>
          {bgSettings.url && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="caption">缩放 {bgSettings.scale}%</Typography><Slider value={bgSettings.scale} onChange={(_, v) => updateBgSetting('scale', v as number)} min={50} max={200} />
              <Typography variant="caption">水平位置</Typography><Slider value={bgSettings.posX} onChange={(_, v) => updateBgSetting('posX', v as number)} min={0} max={100} />
              <Typography variant="caption">垂直位置</Typography><Slider value={bgSettings.posY} onChange={(_, v) => updateBgSetting('posY', v as number)} min={0} max={100} />
              <Box sx={{ height: 100, borderRadius: 2, backgroundImage: `url(${bgSettings.url})`, backgroundSize: `${bgSettings.scale}%`, backgroundPosition: `${bgSettings.posX}% ${bgSettings.posY}%`, border: '1px solid #ddd', mt: 1 }} />
            </Box>
          )}
          <Button variant="contained" fullWidth sx={{ mt: 3 }} onClick={() => setSettingsOpen(false)}>完成</Button>
        </DialogContent>
      </Dialog>

      {/* 功能介绍 */}
      <Dialog open={infoOpen} onClose={() => setInfoOpen(false)}>
        <DialogContent>
          <Typography variant="h6" fontWeight={700}>💡 灵感是什么？</Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>记录一闪而过的想法、想尝试的事物、怕忘记的点子。比如：想做辣椒炒肉、周末爬山计划等。</Typography>
          <Button variant="contained" fullWidth sx={{ mt: 2 }} onClick={() => setInfoOpen(false)}>明白啦</Button>
        </DialogContent>
      </Dialog>
    </Box>
  );
}
