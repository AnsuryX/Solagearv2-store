import { supabase } from '../lib/supabase';

const tableMap = {
  'Product': 'products',
  'BlogPost': 'blog_posts',
  'FAQ': 'faqs',
  'Order': 'orders',
  'Customer': 'customers'
};

const wrapEntity = (entityName) => {
  const tableName = tableMap[entityName] || entityName.toLowerCase();
  
  const checkSupabase = () => {
    if (!supabase) {
      console.error('Supabase client is not initialized in base44Client');
      throw new Error('Database client not initialized');
    }
    return supabase;
  };

  return {
    filter: async (query = {}, order = null, limit = 50) => {
      const client = checkSupabase();
      let q = client.from(tableName).select('*');
      Object.entries(query).forEach(([key, value]) => {
        q = q.eq(key, value);
      });
      if (order) {
        const descending = order.startsWith('-');
        const column = descending ? order.substring(1) : order;
        q = q.order(column, { ascending: !descending });
      }
      if (limit) q = q.limit(limit);
      const { data, error } = await q;
      if (error) throw error;
      return data || [];
    },
    list: async (order = null, limit = 50) => {
      const client = checkSupabase();
      let q = client.from(tableName).select('*');
      if (order) {
        const descending = order.startsWith('-');
        const column = descending ? order.substring(1) : order;
        q = q.order(column, { ascending: !descending });
      }
      if (limit) q = q.limit(limit);
      const { data, error } = await q;
      if (error) throw error;
      return data || [];
    },
    get: async (id) => {
      const client = checkSupabase();
      const { data, error } = await client.from(tableName).select('*').eq('id', id);
      if (error) throw error;
      return data?.[0] || null;
    },
    create: async (payload) => {
      const client = checkSupabase();
      const { data, error } = await client.from(tableName).insert(payload).select();
      if (error) throw error;
      return data?.[0] || null;
    },
    update: async (id, payload) => {
      const client = checkSupabase();
      const { data, error } = await client.from(tableName).update(payload).eq('id', id).select();
      if (error) throw error;
      return data?.[0] || null;
    },
    delete: async (id) => {
      const client = checkSupabase();
      const { error } = await client.from(tableName).delete().eq('id', id);
      if (error) throw error;
      return true;
    }
  };
};

export const db = {
  supabase,
  auth: {
    isAuthenticated: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      return !!session;
    },
    me: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      return {
        ...user,
        role: user.email === 'solargearlrd@gmail.com' ? 'admin' : 'user'
      };
    },
    logout: async () => {
      await supabase.auth.signOut();
    },
    redirectToLogin: () => {
      // In a real app, this might redirect to a login page
      window.location.href = '/login';
    }
  },
  entities: new Proxy({}, {
    get: (target, entityName) => wrapEntity(entityName)
  }),
  integrations: {
    Core: {
      UploadFile: async ({ file }) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const { data, error } = await supabase.storage.from('uploads').upload(fileName, file);
        if (error) throw error;
        const { data: { publicUrl } } = supabase.storage.from('uploads').getPublicUrl(fileName);
        return { file_url: publicUrl };
      },
      SendEmail: async (params) => {
        console.log('Sending email via Supabase (Edge Function placeholder):', params);
        return { success: true };
      }
    }
  }
};

export const base44 = db;
export default db;
