(function() {
    if (window.__supabaseClient) {
        console.log('✅ Supabase client already exists, reusing');
        return;
    }
    var SUPABASE_URL = 'https://cvltwxxfkfckbixwhnhl.supabase.co';
    var SUPABASE_ANON_KEY = 'sb_publishable_wv9niqm-nwI8Gpfaoi_fKg_pHa-FocS';
    try {
        if (typeof window.supabase !== 'undefined' && window.supabase.createClient) {
            window.__supabaseClient = window.supabase.createClient(
                SUPABASE_URL,
                SUPABASE_ANON_KEY
            );
            console.log('✅ Supabase client initialized (singleton)');
        } else {
            console.warn('⚠️ Supabase not loaded yet');
        }
    } catch(e) {
        console.error('❌ Supabase init error:', e);
    }
    window.SUPABASE_URL = SUPABASE_URL;
    window.SUPABASE_ANON_KEY = SUPABASE_ANON_KEY;
    window.getSupabase = function() {
        return window.__supabaseClient || null;
    };
})();