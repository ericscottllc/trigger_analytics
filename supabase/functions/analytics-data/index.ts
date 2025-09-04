import { createClient } from 'npm:@supabase/supabase-js@2';

interface AnalyticsQuery {
  type: 'basis_trend' | 'price_trend' | 'master_data';
  filters?: {
    crop_class_code?: string;
    region_id?: string;
    elevator_id?: string;
    town_id?: string;
    date_from?: string;
    date_to?: string;
  };
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { type, filters = {} }: AnalyticsQuery = await req.json();

    let query = '';
    
    if (type === 'basis_trend' || type === 'price_trend' || type === 'master_data') {
      query = `
        SELECT 
          ge.date,
          ge.basis,
          ge.cash_price,
          ge.futures,
          mc.name as crop_name,
          cc.name as class_name,
          cc.code as class_code,
          cc.id as class_id,
          me.name as elevator_name,
          me.id as elevator_id,
          mt.name as town_name,
          mt.id as town_id,
          mr.name as region_name,
          mr.id as region_id
        FROM grain_entries ge
        LEFT JOIN master_crops mc ON ge.crop_id = mc.id
        LEFT JOIN crop_classes cc ON ge.class_id = cc.id
        LEFT JOIN master_elevators me ON ge.elevator_id = me.id
        LEFT JOIN master_towns mt ON ge.town_id = mt.id
        LEFT JOIN town_regions tr ON mt.id = tr.town_id AND tr.is_active = true
        LEFT JOIN master_regions mr ON tr.region_id = mr.id
        WHERE ge.is_active = true 
      `;
      
      // Add specific filters for different report types
      if (type === 'basis_trend') {
        query += ` AND ge.basis IS NOT NULL`;
      } else if (type === 'price_trend') {
        query += ` AND ge.cash_price IS NOT NULL`;
      }
      // master_data gets all records (no additional filters)
    }

    // Apply filters
    const conditions: string[] = [];
    
    if (filters.crop_class_code) {
      conditions.push(`cc.code = '${filters.crop_class_code}'`);
    }
    
    if (filters.region_id) {
      conditions.push(`mr.id = '${filters.region_id}'`);
    }
    
    if (filters.elevator_id) {
      conditions.push(`me.id = '${filters.elevator_id}'`);
    }
    
    if (filters.town_id) {
      conditions.push(`mt.id = '${filters.town_id}'`);
    }
    
    if (filters.date_from) {
      conditions.push(`ge.date >= '${filters.date_from}'`);
    }
    
    if (filters.date_to) {
      conditions.push(`ge.date <= '${filters.date_to}'`);
    }

    if (conditions.length > 0) {
      query += ` AND ${conditions.join(' AND ')}`;
    }

    query += ` ORDER BY ge.date ASC`;

    // Execute the raw SQL query
    const { data, error } = await supabase.rpc('execute_sql', {
      query: query
    });

    if (error) {
      throw error;
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: data || [],
        count: data?.length || 0,
        type,
        filters 
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      },
    );

  } catch (error) {
    console.error('Analytics data error:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Failed to fetch analytics data',
        data: [],
        count: 0
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      },
    );
  }
});