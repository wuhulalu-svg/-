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
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Settings as SettingsIcon,
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
}

export default function InspirationView() {
  const [sections, setSections] = useState<ListSection[]>([
    { id: '1', name: '要购买的东西', items: [], editable: false },
    { id: '2', name: '想要做的菜', items: [], editable: false },
    { id: '3', name: '待办事项', items: [], editable: true },
  ]);

  const [editNameDialog, setEditNameDialog] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [editingSectionId, setEditingSectionId] = useState('');
  const [newSectionName, setNewSectionName] = useState('');
  const [inspirationBgImage, setInspirationBgImage] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('inspirationSections');
    const savedBg = localStorage.getItem('inspirationBgImage');
    if (saved) {
      setSections(JSON.parse(saved));
    }
    if (savedBg) {
      setInspirationBgImage(savedBg);
    }
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

  const sectionColors = [
    { bg: '#FFF4E6', border: '#FFB800' },
    { bg: '#FFE6F0', border: '#FF6B9D' },
    { bg: '#E6F4FF', border: '#1890FF' },
  ];

  return (
    <Box sx={{ bgcolor: '#FAFAFA', minHeight: '100%', p: 2 }}>
      <Stack direction="row" justifyContent="flex-end" mb={2}>
        <IconButton onClick={() => setSettingsOpen(true)}>
          <SettingsIcon />
        </IconButton>
      </Stack>
      <Stack spacing={3}>
        {sections.map((section, index) => (
          <Card
            key={section.id}
            sx={{
              bgcolor: sectionColors[index].bg,
              backgroundImage: inspirationBgImage ? `linear-gradient(rgba(255, 255, 255, 0.85), rgba(255, 255, 255, 0.85)), url(${inspirationBgImage})` : 'none',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              border: `2px solid ${sectionColors[index].border}`,
              borderRadius: 3,
              p: 2.5,
              position: 'relative',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            }}
          >
            {/* Header */}
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {section.name}
                </Typography>
                {section.editable && (
                  <IconButton
                    size="small"
                    onClick={() => openEditNameDialog(section.id)}
                    sx={{ color: sectionColors[index].border }}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                )}
              </Stack>
              <Button
                size="small"
                startIcon={<AddIcon />}
                onClick={() => addItem(section.id)}
                sx={{
                  textTransform: 'none',
                  color: sectionColors[index].border,
                  borderColor: sectionColors[index].border,
                  '&:hover': {
                    borderColor: sectionColors[index].border,
                    bgcolor: alpha(sectionColors[index].border, 0.1),
                  },
                }}
                variant="outlined"
              >
                添加
              </Button>
            </Stack>

            {/* Items */}
            <Stack spacing={1}>
              {section.items.length > 0 ? (
                section.items.map((item) => (
                  <Stack
                    key={item.id}
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    sx={{
                      p: 1,
                      borderRadius: 2,
                      bgcolor: 'white',
                      border: '1px solid',
                      borderColor: alpha(sectionColors[index].border, 0.3),
                    }}
                  >
                    <Checkbox
                      checked={item.completed}
                      onChange={() => toggleItem(section.id, item.id)}
                      size="small"
                      sx={{
                        color: sectionColors[index].border,
                        '&.Mui-checked': {
                          color: sectionColors[index].border,
                        },
                      }}
                    />
                    <TextField
                      fullWidth
                      value={item.content}
                      onChange={(e) => updateItem(section.id, item.id, e.target.value)}
                      placeholder="输入内容..."
                      variant="standard"
                      size="small"
                      sx={{
                        '& .MuiInput-root': {
                          fontSize: '0.9rem',
                          textDecoration: item.completed ? 'line-through' : 'none',
                          opacity: item.completed ? 0.6 : 1,
                        },
                        '& .MuiInput-root:before': {
                          borderBottom: 'none',
                        },
                        '& .MuiInput-root:hover:not(.Mui-disabled):before': {
                          borderBottom: 'none',
                        },
                      }}
                      InputProps={{
                        disableUnderline: false,
                      }}
                    />
                    <IconButton
                      size="small"
                      onClick={() => deleteItem(section.id, item.id)}
                      sx={{ color: 'error.main' }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                ))
              ) : (
                <Box
                  sx={{
                    p: 4,
                    textAlign: 'center',
                    color: 'text.secondary',
                    opacity: 0.5,
                  }}
                >
                  <Typography variant="body2">暂无内容，点击添加按钮开始</Typography>
                </Box>
              )}
            </Stack>
          </Card>
        ))}
      </Stack>

      {/* Edit Name Dialog */}
      <Dialog open={editNameDialog} onClose={() => setEditNameDialog(false)} maxWidth="sm" fullWidth>
        <DialogContent>
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
        <DialogActions>
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

      {/* Settings Dialog */}
      <Dialog open={settingsOpen} onClose={() => setSettingsOpen(false)} fullWidth maxWidth="sm">
        <DialogContent>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
            ⚙️ 背景设置
          </Typography>
          <Stack spacing={3}>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5 }}>
                灵感列表背景
              </Typography>
              <Button
                variant="outlined"
                component="label"
                fullWidth
                sx={{ textTransform: 'none' }}
              >
                {inspirationBgImage ? '更换背景图片' : '上传背景图片'}
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleBgUpload}
                />
              </Button>
              {inspirationBgImage && (
                <Box
                  sx={{
                    mt: 2,
                    height: 100,
                    borderRadius: 2,
                    backgroundImage: `url(${inspirationBgImage})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    border: '1px solid #E0E0E0',
                  }}
                />
              )}
            </Box>
            <Button
              variant="contained"
              onClick={() => setSettingsOpen(false)}
              sx={{ textTransform: 'none' }}
            >
              完成
            </Button>
          </Stack>
        </DialogContent>
      </Dialog>
    </Box>
  );
}
