import { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  IconButton,
  Typography,
  Stack,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  Collapse,
  alpha,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  FitnessCenter as FitnessIcon,
  Restaurant as RestaurantIcon,
  Psychology as PsychologyIcon,
  Schedule as ScheduleIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';

interface Strategy {
  id: string;
  title: string;
  content: string;
}

const strategyIcons: { [key: string]: any } = {
  '健康': FitnessIcon,
  '饮食': RestaurantIcon,
  '心理': PsychologyIcon,
  '默认': ScheduleIcon,
};

const getStrategyIcon = (title: string) => {
  for (const [key, Icon] of Object.entries(strategyIcons)) {
    if (title.includes(key)) return Icon;
  }
  return strategyIcons['默认'];
};

interface StrategyWithExpanded extends Strategy {
  expanded: boolean;
}

export default function StrategySettings() {
  const [strategies, setStrategies] = useState<StrategyWithExpanded[]>(() => {
    const saved = localStorage.getItem('strategies');
    return saved ? JSON.parse(saved) : [];
  });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [editingStrategy, setEditingStrategy] = useState<StrategyWithExpanded | null>(null);
  const [formData, setFormData] = useState({ title: '', content: '' });
  const [strategyBgImage, setStrategyBgImage] = useState('');

  useEffect(() => {
    localStorage.setItem('strategies', JSON.stringify(strategies));
  }, [strategies]);

  useEffect(() => {
    const saved = localStorage.getItem('strategyBgImage');
    if (saved) setStrategyBgImage(saved);
  }, []);

  const handleBgUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setStrategyBgImage(result);
        localStorage.setItem('strategyBgImage', result);
      };
      reader.readAsDataURL(file);
    }
  };

  const openDialog = (strategy?: StrategyWithExpanded) => {
    if (strategy) {
      setEditingStrategy(strategy);
      setFormData({ title: strategy.title, content: strategy.content });
    } else {
      setEditingStrategy(null);
      setFormData({ title: '', content: '' });
    }
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingStrategy(null);
    setFormData({ title: '', content: '' });
  };

  const saveStrategy = () => {
    if (!formData.title.trim()) return;

    if (editingStrategy) {
      setStrategies(strategies.map(s =>
        s.id === editingStrategy.id
          ? { ...s, title: formData.title, content: formData.content }
          : s
      ));
    } else {
      const newStrategy: StrategyWithExpanded = {
        id: Date.now().toString(),
        title: formData.title,
        content: formData.content,
        expanded: false,
      };
      setStrategies([...strategies, newStrategy]);
    }

    closeDialog();
  };

  const deleteStrategy = (id: string) => {
    setStrategies(strategies.filter(s => s.id !== id));
  };

  const toggleExpanded = (id: string) => {
    setStrategies(strategies.map(s =>
      s.id === id ? { ...s, expanded: !s.expanded } : s
    ));
  };

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => openDialog()}
          sx={{
            textTransform: 'none',
            boxShadow: 2,
            '&:hover': {
              boxShadow: 4,
            },
          }}
        >
          添加策略
        </Button>
        <IconButton onClick={() => setSettingsOpen(true)}>
          <SettingsIcon />
        </IconButton>
      </Stack>

      <Stack spacing={2}>
        {strategies.map((strategy) => {
          const Icon = getStrategyIcon(strategy.title);
          return (
            <Card
              key={strategy.id}
                elevation={2}
                sx={{
                  p: 3,
                  height: '100%',
                  transition: 'all 0.2s',
                  border: '1px solid',
                  borderColor: 'divider',
                  bgcolor: 'rgba(255, 255, 255, 0.95)',
                  backgroundImage: strategyBgImage ? `linear-gradient(rgba(255, 255, 255, 0.85), rgba(255, 255, 255, 0.85)), url(${strategyBgImage})` : 'none',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backdropFilter: 'blur(10px)',
                  '&:hover': {
                    boxShadow: 4,
                    borderColor: 'primary.main',
                  },
                }}
              >
                <Stack spacing={2}>
                  <Stack direction="row" alignItems="center" spacing={1.5}>
                    <Box
                      sx={{
                        p: 1,
                        borderRadius: 2,
                        bgcolor: alpha('#6366f1', 0.1),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Icon sx={{ fontSize: 24, color: 'primary.main' }} />
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, flex: 1 }}>
                      {strategy.title}
                    </Typography>
                  </Stack>

                  {strategy.content && (
                    <>
                      <Collapse in={strategy.expanded} collapsedSize={60}>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            whiteSpace: 'pre-wrap',
                            lineHeight: 1.6,
                          }}
                        >
                          {strategy.content}
                        </Typography>
                      </Collapse>
                      {strategy.content.length > 100 && (
                        <Button
                          size="small"
                          onClick={() => toggleExpanded(strategy.id)}
                          endIcon={strategy.expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                          sx={{ textTransform: 'none', alignSelf: 'flex-start' }}
                        >
                          {strategy.expanded ? '收起' : '展开'}
                        </Button>
                      )}
                    </>
                  )}

                  <Stack direction="row" spacing={1}>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<EditIcon />}
                      onClick={() => openDialog(strategy)}
                      sx={{ flex: 1, textTransform: 'none' }}
                    >
                      编辑
                    </Button>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => deleteStrategy(strategy.id)}
                      sx={{
                        '&:hover': {
                          bgcolor: alpha('#f44336', 0.1),
                        },
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Stack>
                </Stack>
              </Card>
          );
        })}

        {strategies.length === 0 && (
            <Card
              sx={{
                p: 8,
                textAlign: 'center',
                bgcolor: alpha('#6366f1', 0.02),
                border: '2px dashed',
                borderColor: 'divider',
              }}
            >
              <ScheduleIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                暂无策略
              </Typography>
              <Typography variant="body2" color="text.disabled">
                点击上方按钮添加新策略
              </Typography>
            </Card>
        )}
      </Stack>

      <Dialog open={dialogOpen} onClose={closeDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingStrategy ? '编辑策略' : '添加策略'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="策略名称"
              placeholder="例如：健康策略、饮食策略"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="策略内容"
              placeholder="输入策略的详细内容..."
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              fullWidth
              multiline
              rows={6}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog}>取消</Button>
          <Button onClick={saveStrategy} variant="contained" disabled={!formData.title.trim()}>
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
                策略卡片背景
              </Typography>
              <Button
                variant="outlined"
                component="label"
                fullWidth
                sx={{ textTransform: 'none' }}
              >
                {strategyBgImage ? '更换背景图片' : '上传背景图片'}
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleBgUpload}
                />
              </Button>
              {strategyBgImage && (
                <Box
                  sx={{
                    mt: 2,
                    height: 100,
                    borderRadius: 2,
                    backgroundImage: `url(${strategyBgImage})`,
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
