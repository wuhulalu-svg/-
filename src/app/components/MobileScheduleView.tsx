// 在 MobileScheduleView.tsx 中找到添加计划的 Dialog，替换其中的 Stack direction="row" 部分为以下内容：

<Stack direction="row" spacing={2} alignItems="center">
  {/* 小时选择 1-12 */}
  <TextField
    select
    label="小时"
    value={newPlanStartTime.split(':')[0]}
    onChange={(e) => {
      const hour = e.target.value;
      const minute = newPlanStartTime.split(':')[1]?.split(' ')[0] || '00';
      const ampm = newPlanStartTime.includes('PM') ? 'PM' : 'AM';
      setNewPlanStartTime(`${hour}:${minute} ${ampm}`);
    }}
    sx={{ flex: 1 }}
    SelectProps={{ native: true }}
  >
    {Array.from({ length: 12 }, (_, i) => i + 1).map(h => (
      <option key={h} value={h.toString().padStart(2, '0')}>{h}</option>
    ))}
  </TextField>
  <Typography>:</Typography>
  {/* 分钟选择 0-59 */}
  <TextField
    select
    label="分钟"
    value={newPlanStartTime.split(':')[1]?.split(' ')[0] || '00'}
    onChange={(e) => {
      const minute = e.target.value;
      const hour = newPlanStartTime.split(':')[0];
      const ampm = newPlanStartTime.includes('PM') ? 'PM' : 'AM';
      setNewPlanStartTime(`${hour}:${minute} ${ampm}`);
    }}
    sx={{ flex: 1 }}
    SelectProps={{ native: true }}
  >
    {Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0')).map(m => (
      <option key={m} value={m}>{m}</option>
    ))}
  </TextField>
  {/* AM/PM 选择 */}
  <TextField
    select
    label="上午/下午"
    value={newPlanStartTime.includes('PM') ? 'PM' : 'AM'}
    onChange={(e) => {
      const ampm = e.target.value;
      const [hour, minute] = newPlanStartTime.split(' ');
      setNewPlanStartTime(`${hour} ${ampm}`);
    }}
    sx={{ flex: 1 }}
    SelectProps={{ native: true }}
  >
    <option value="AM">上午</option>
    <option value="PM">下午</option>
  </TextField>
</Stack>
