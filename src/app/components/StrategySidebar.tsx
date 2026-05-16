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
  Divider,
  Card,
  Collapse,
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
} from '@mui/icons-material';

interface Strategy {
  id: string;
  title: string;
  content: string;
  expanded: boolean;
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

export default function StrategySidebar() {
  const [strategies, setStrategies] = useState<Strategy[]>(() => {
    const saved = localStorage.getItem('strategies');
    return saved ? JSON.parse(saved) : [];
  });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingStrategy, setEditingStrategy] = useState<Strategy | null>(null);
  const [formData, setFormData] = useState({ title: '', content: '' });

  useEffect(() => {
    localStorage.setItem('strategies', JSON.stringify(strategies));
  }, [strategies]);

  const openDialog = (strategy?: Strategy) => {
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
      const newStrategy: Strategy = {
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
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 3, pb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          策略设置
        </Typography>
        <Button
          variant="contained"
          fullWidth
          startIcon={<AddIcon />}
          onClick={() => openDialog()}
          sx={{
            py: 1.2,
            textTransform: 'none',
            fontSize: '0.95rem',
          }}
        >
          添加新策略
        </Button>
      </Box>

      <Divider />

      <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
        <Stack spacing={1.5}>
          {strategies.map((strategy) => {
            const Icon = getStrategyIcon(strategy.title);
            return (
              <Card
                key={strategy.id}
                sx={{
                  p: 2,
                  transition: 'all 0.2s',
                  '&:hover': {
                    boxShadow: 3,
                  },
                }}
              >
                <Stack spacing={1}>
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <Stack direction="row" alignItems="center" spacing={1} flex={1}>
                      <Icon sx={{ fontSize: 20, color: 'primary.main' }} />
                      <Typography
                        variant="subtitle2"
                        sx={{ fontWeight: 600, flex: 1 }}
                      >
                        {strategy.title}
                      </Typography>
                      {strategy.content && (
                        <IconButton
                          size="small"
                          onClick={() => toggleExpanded(strategy.id)}
                        >
                          {strategy.expanded ? (
                            <ExpandLessIcon fontSize="small" />
                          ) : (
                            <ExpandMoreIcon fontSize="small" />
                          )}
                        </IconButton>
                      )}
                    </Stack>
                  </Stack>

                  <Collapse in={strategy.expanded}>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}
                    >
                      {strategy.content}
                    </Typography>
                  </Collapse>

                  <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                    <IconButton
                      size="small"
                      onClick={() => openDialog(strategy)}
                      sx={{ color: 'text.secondary' }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => deleteStrategy(strategy.id)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                </Stack>
              </Card>
            );
          })}

          {strategies.length === 0 && (
            <Box sx={{ py: 6, textAlign: 'center' }}>
              <ScheduleIcon
                sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }}
              />
              <Typography variant="body2" color="text.secondary">
                暂无策略
              </Typography>
              <Typography variant="caption" color="text.disabled">
                点击上方按钮添加策略
              </Typography>
            </Box>
          )}
        </Stack>
      </Box>

      <Dialog open={dialogOpen} onClose={closeDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>
          {editingStrategy ? '编辑策略' : '添加策略'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
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
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={closeDialog} sx={{ textTransform: 'none' }}>
            取消
          </Button>
          <Button
            onClick={saveStrategy}
            variant="contained"
            disabled={!formData.title.trim()}
            sx={{ textTransform: 'none' }}
          >
            保存
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
