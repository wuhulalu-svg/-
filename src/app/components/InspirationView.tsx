import { useState, useEffect, useRef } from 'react';
import {
  Box, Typography, Stack, IconButton, Paper, Tabs, Tab, TextField, Checkbox,
  Button, Dialog, DialogContent, DialogActions, alpha, Menu, MenuItem, Card,
} from '@mui/material';
import {
  Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon,
  Settings as SettingsIcon, Info as InfoIcon,
} from '@mui/icons-material';

// ---------- 图片编辑器（与策略相同） ----------
function ImageEditor({ imageUrl, onUpdate, initialScale = 100, initialPosX = 50, initialPosY = 50, initialOpacity = 100 }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(initialScale);
  const [posX, setPosX] = useState(initialPosX);
  const [posY, setPosY] = useState(initialPosY);
  const [opacity, setOpacity] = useState(initialOpacity);
  const [isDragging, setIsDragging] = useState(false);
  const lastPos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const img = new Image();
    img.src = imageUrl;
    img.onload = () => {
      const w = canvas.width = container.clientWidth;
      const h = canvas.height = container.clientHeight;
      ctx.clearRect(0, 0, w, h);
      ctx.globalAlpha = opacity / 100;
      const scaleVal = scale / 100;
      const drawW = w * scaleVal;
      const drawH = h * scaleVal;
      const dx = (posX / 100) * (w - drawW);
      const dy = (posY / 100) * (h - drawH);
      ctx.drawImage(img, dx, dy, drawW, drawH);
      ctx.globalAlpha = 1;
    };
  }, [imageUrl, scale, posX, opacity]);

  const startDrag = (clientX, clientY) => {
    setIsDragging(true);
    lastPos.current = { x: clientX, y: clientY };
  };
  const onDrag = (clientX, clientY) => {
    if (!isDragging) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const deltaX = (clientX - lastPos.current.x) * scaleX;
    const deltaY = (clientY - lastPos.current.y) * scaleY;
    const w = canvas.width;
    const h = canvas.height;
    const scaleVal = scale / 100;
    const drawW = w * scaleVal;
    const drawH = h * scaleVal;
    const maxDeltaX = (w - drawW) / 2;
    const maxDeltaY = (h - drawH) / 2;
    let newPosX = posX + (deltaX / maxDeltaX) * 50;
    let newPosY = posY + (deltaY / maxDeltaY) * 50;
    newPosX = Math.min(100, Math.max(0, newPosX));
    newPosY = Math.min(100, Math.max(0, newPosY));
    setPosX(newPosX);
    setPosY(newPosY);
    lastPos.current = { x: clientX, y: clientY };
    onUpdate({ scale, posX: newPosX, posY: newPosY, opacity });
  };
  const endDrag = () => setIsDragging(false);

  const handleMouseDown = (e) => startDrag(e.clientX, e.clientY);
  const handleMouseMove = (e) => onDrag(e.clientX, e.clientY);
  const handleMouseUp = () => endDrag();
  const handleTouchStart = (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    startDrag(touch.clientX, touch.clientY);
  };
  const handleTouchMove = (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    onDrag(touch.clientX, touch.clientY);
  };
  const handleTouchEnd = (e) => {
    e.preventDefault();
    endDrag();
  };

  const handleScaleSlider = (e) => {
    const newScale = Number(e.target.value);
    setScale(newScale);
    onUpdate({ scale: newScale, posX, posY, opacity });
  };
  const handleOpacitySlider = (e) => {
    const newOpacity = Number(e.target.value);
    setOpacity(newOpacity);
    onUpdate({ scale, posX, posY, opacity: newOpacity });
  };

  const handleChangeImage = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        const newUrl = ev.target?.result as string;
        setScale(100);
        setPosX(50);
        setPosY(50);
        setOpacity(100);
        onUpdate({ url: newUrl, scale: 100, posX: 50, posY: 50, opacity: 100 });
      };
      reader.readAsDataURL(file);
    };
    input.click();
  };

  return (
    <Box>
      <Box ref={containerRef} sx={{ width: 300, height: 400, margin: '0 auto', border: '1px solid #ccc', borderRadius: 2, overflow: 'hidden', touchAction: 'none' }}>
        <canvas
          ref={canvasRef}
          style={{ width: '100%', height: '100%', display: 'block' }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        />
      </Box>
      <Typography variant="caption" display="block" sx={{ mt: 1, textAlign: 'center' }}>
        手指拖动移动图片，下方滑块缩放/透明度
      </Typography>
      <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
        <Box sx={{ flex: 1 }}>
          <Typography variant="caption">缩放 ({scale}%)</Typography>
          <input type="range" min={50} max={200} step={1} value={scale} onChange={handleScaleSlider} style={{ width: '100%' }} />
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography variant="caption">透明度 ({opacity}%)</Typography>
          <input type="range" min={0} max={100} step={1} value={opacity} onChange={handleOpacitySlider} style={{ width: '100%' }} />
        </Box>
      </Stack>
      <Button variant="outlined" size="small" fullWidth sx={{ mt: 1 }} onClick={handleChangeImage}>
        更换图片
      </Button>
    </Box>
  );
}

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
  // 卡片背景（无整体背景）
  const [cardBg, setCardBg] = useState({ url: '', scale: 100, posX: 50, posY: 50, opacity: 100 });
  const [tempCardBg, setTempCardBg] = useState({ url: '', scale: 100, posX: 50, posY: 50, opacity: 100 });

  useEffect(() => {
    const savedBoxes = localStorage.getItem('inspirationBoxes');
    const savedActive = localStorage.getItem('inspirationActiveBoxId');
    const savedCard = localStorage.getItem('inspirationCardBg');
    if (savedBoxes) setBoxes(JSON.parse(savedBoxes));
    if (savedActive) setActiveBoxId(savedActive);
    if (savedCard) {
      const parsed = JSON.parse(savedCard);
      setCardBg(parsed);
      setTempCardBg(parsed);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('inspirationBoxes', JSON.stringify(boxes));
  }, [boxes]);
  useEffect(() => {
    localStorage.setItem('inspirationActiveBoxId', activeBoxId);
  }, [activeBoxId]);
  useEffect(() => {
    localStorage.setItem('inspirationCardBg', JSON.stringify(cardBg));
  }, [cardBg]);

  const openSettings = () => {
    setTempCardBg({ ...cardBg });
    setSettingsOpen(true);
  };
  const applySettings = () => {
    setCardBg(tempCardBg);
    setSettingsOpen(false);
  };
  const cancelSettings = () => {
    setSettingsOpen(false);
  };
  const updateTempCardBg = (updates: any) => {
    setTempCardBg({ ...tempCardBg, ...updates });
  };

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

  const handleMenuOpen = (e: React.MouseEvent<HTMLElement>, boxId: string) => {
    setMenuAnchor(e.currentTarget);
    setMenuBoxId(boxId);
  };
  const handleMenuClose = () => {
    setMenuAnchor(null);
    setMenuBoxId('');
  };

  useEffect(() => {
    const handler = () => addItem();
    window.addEventListener('openAddInspirationItem', handler);
    return () => window.removeEventListener('openAddInspirationItem', handler);
  }, [activeBoxId]);

  return (
    <Box sx={{ minHeight: '100%', p: 1.5, bgcolor: '#FAFAFA' }}>
      <Stack spacing={1.5}>
        <Stack direction="row" justifyContent="flex-end" spacing={1}>
          <IconButton size="small" onClick={() => setInfoOpen(true)}><InfoIcon fontSize="small" /></IconButton>
          <IconButton size="small" onClick={openSettings}><SettingsIcon fontSize="small" /></IconButton>
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
            <Card sx={{
              backgroundImage: cardBg.url ? `url(${cardBg.url})` : 'none',
              backgroundSize: `${cardBg.scale}%`,
              backgroundPosition: `${cardBg.posX}% ${cardBg.posY}%`,
              p: 1,
              transition: 'all 0.2s',
            }}>
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
            </Card>
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

      {/* 卡片背景设置对话框 */}
      <Dialog open={settingsOpen} onClose={cancelSettings} maxWidth="md" fullWidth>
        <DialogContent>
          <Typography variant="h6" fontWeight={700} mb={2}>🎨 卡片背景设置</Typography>
          {tempCardBg.url ? (
            <ImageEditor
              imageUrl={tempCardBg.url}
              onUpdate={updateTempCardBg}
              initialScale={tempCardBg.scale}
              initialPosX={tempCardBg.posX}
              initialPosY={tempCardBg.posY}
              initialOpacity={tempCardBg.opacity}
            />
          ) : (
            <Button variant="outlined" component="label" fullWidth sx={{ mt: 1 }}>
              上传卡片背景图片
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = (ev) => {
                    const url = ev.target?.result as string;
                    updateTempCardBg({ url, scale: 100, posX: 50, posY: 50, opacity: 100 });
                  };
                  reader.readAsDataURL(file);
                }}
              />
            </Button>
          )}
          <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
            <Button variant="outlined" onClick={cancelSettings} sx={{ flex: 1 }}>取消</Button>
            <Button variant="contained" onClick={applySettings} sx={{ flex: 1 }}>确定</Button>
          </Stack>
        </DialogContent>
      </Dialog>

      {/* 功能介绍 */}
      <Dialog open={infoOpen} onClose={() => setInfoOpen(false)}>
        <DialogContent>
          <Typography variant="h6" fontWeight={700}>💡 灵感是什么？</Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>记录一闪而过的想法，比如想做辣椒炒肉、周末爬山计划等。</Typography>
          <Button variant="contained" fullWidth sx={{ mt: 2 }} onClick={() => setInfoOpen(false)}>明白啦</Button>
        </DialogContent>
      </Dialog>
    </Box>
  );
}
