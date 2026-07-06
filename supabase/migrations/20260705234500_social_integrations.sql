-- Função genérica para atualizar a coluna updated_at
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Tabela para armazenar as integrações com redes sociais
CREATE TABLE public.social_integrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    platform VARCHAR(50) NOT NULL, -- ex: 'instagram'
    account_id VARCHAR(255) NOT NULL, -- ID da conta no Instagram/Meta
    account_name VARCHAR(255),
    access_token TEXT NOT NULL,
    token_expires_at TIMESTAMPTZ,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraint para evitar múltiplas integrações ativas da mesma plataforma, 
    -- ou pode ser atrelado a um tenant_id/user_id se for multi-tenant.
    -- Como é MVP, deixaremos simples:
    CONSTRAINT unique_platform_account UNIQUE (platform, account_id)
);

-- Ativar RLS
ALTER TABLE public.social_integrations ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS
CREATE POLICY "Apenas admins podem ler integrations"
    ON public.social_integrations
    FOR SELECT
    USING (auth.uid() IN (SELECT id FROM profiles WHERE role IN ('diretor', 'gestor')));

CREATE POLICY "Apenas admins podem gerenciar integrations"
    ON public.social_integrations
    FOR ALL
    USING (auth.uid() IN (SELECT id FROM profiles WHERE role IN ('diretor', 'gestor')));

-- Função para atualizar o updated_at
CREATE TRIGGER update_social_integrations_modtime
    BEFORE UPDATE ON public.social_integrations
    FOR EACH ROW EXECUTE FUNCTION update_modified_column();
