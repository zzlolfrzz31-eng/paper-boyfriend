const { getSupabaseClient } = require('../src/storage/database/supabase-client');

async function setupAdmin() {
  try {
    const client = getSupabaseClient();
    
    console.log('正在查找第一个用户...');
    
    const { data: users, error } = await client
      .from('users')
      .select('*')
      .order('id', { ascending: true })
      .limit(1);

    if (error) {
      console.error('查询用户失败:', error);
      return;
    }

    if (!users || users.length === 0) {
      console.log('没有找到用户，请先注册一个用户');
      return;
    }

    const user = users[0];
    console.log('找到用户:', user.username);

    if (user.is_admin) {
      console.log('该用户已经是管理员了');
      return;
    }

    console.log('正在设置为管理员...');
    
    const { data: updatedUser, error: updateError } = await client
      .from('users')
      .update({ is_admin: true, status: 'active' })
      .eq('id', user.id)
      .select()
      .single();

    if (updateError) {
      console.error('设置管理员失败:', updateError);
      return;
    }

    console.log('✅ 成功设置管理员!');
    console.log('用户:', updatedUser.username);
    console.log('现在可以访问 /admin 了');

  } catch (error) {
    console.error('设置管理员时出错:', error);
  }
}

setupAdmin();
