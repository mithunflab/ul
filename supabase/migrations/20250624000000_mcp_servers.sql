-- Create mcp_servers table
create table public.mcp_servers (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) on delete cascade not null,
    name text not null,
    url text not null,
    authorization_token text,
    tool_configuration jsonb default '{"enabled": true}'::jsonb,
    status text default 'disconnected' check (status in ('connected', 'disconnected', 'testing')),
    tools jsonb default '[]'::jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add RLS policies
alter table public.mcp_servers enable row level security;

-- Policy for users to view their own MCP servers
create policy "Users can view their own MCP servers"
    on public.mcp_servers for select
    using (auth.uid() = user_id);

-- Policy for users to insert their own MCP servers
create policy "Users can insert their own MCP servers"
    on public.mcp_servers for insert
    with check (auth.uid() = user_id);

-- Policy for users to update their own MCP servers
create policy "Users can update their own MCP servers"
    on public.mcp_servers for update
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

-- Policy for users to delete their own MCP servers
create policy "Users can delete their own MCP servers"
    on public.mcp_servers for delete
    using (auth.uid() = user_id);

-- Create trigger to automatically update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
    new.updated_at = timezone('utc'::text, now());
    return new;
end;
$$ language plpgsql;

create trigger handle_mcp_servers_updated_at
    before update on public.mcp_servers
    for each row
    execute procedure public.handle_updated_at();

-- Add indexes for better performance
create index mcp_servers_user_id_idx on public.mcp_servers(user_id);
create index mcp_servers_status_idx on public.mcp_servers(status); 