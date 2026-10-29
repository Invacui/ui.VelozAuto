import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Search, Eye, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { SEO } from '@/components/common/SEO';
import { StatusBadge } from '@/components/common/StatusBadge';
import { DataTable, type Column } from '@/components/admin/DataTable';
import { Pagination } from '@/components/common/Pagination';
import { listUsers, updateUser } from '@/services/admin.service';
import { queryKeys } from '@/lib/queryKeys';
import { formatDate, getApiErrorMessage, titleCase } from '@/lib/utils';
import { useDebounce } from '@/hooks/useDebounce';
import { useAuth } from '@/hooks/useAuth';
import type { AdminUser } from '@/types/admin.types';
import type { UserRole } from '@/types/auth.types';

const ROLES: UserRole[] = ['USER', 'EMPLOYEE', 'ADMIN'];

export default function AdminUsers() {
  const qc = useQueryClient();
  const { user: me } = useAuth();
  const [q, setQ] = useState('');
  const [role, setRole] = useState('__all__');
  const [page, setPage] = useState(1);
  const [active, setActive] = useState<AdminUser | null>(null);
  const [roleTarget, setRoleTarget] = useState<{ user: AdminUser; role: UserRole } | null>(null);
  const [isVendor, setIsVendor] = useState<boolean | null>(null);
  const [companyName, setCompanyName] = useState('');
  const debouncedQ = useDebounce(q, 350);

  const params = {
    page,
    limit: 15,
    q: debouncedQ || undefined,
    role: role === '__all__' ? undefined : role,
  };

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.admin.users(params),
    queryFn: () => listUsers(params),
  });

  const { mutate: change } = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) => updateUser(id, payload),
    onSuccess: () => {
      toast.success('User updated');
      setRoleTarget(null);
      qc.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
    onError: (e) => toast.error(getApiErrorMessage(e, 'Could not update user')),
  });

  const columns: Column<AdminUser>[] = [
    {
      key: 'user',
      header: 'User',
      render: (u) => (
        <div className="flex items-center gap-3">
          <Avatar className="size-8">
            {u.profileImage ? <AvatarImage src={u.profileImage} alt="" /> : null}
            <AvatarFallback className="text-xs">{u.name?.slice(0, 1).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{u.name}</p>
            <p className="truncate text-xs text-muted-foreground">{u.email}</p>
          </div>
        </div>
      ),
    },
    { key: 'phone', header: 'Phone', render: (u) => u.phone || '—' },
    { key: 'verified', header: 'Verified', render: (u) => (u.emailVerified ? <CheckCircle2 className="size-4 text-green-600" /> : <XCircle className="size-4 text-muted-foreground" />) },
    {
      key: 'role',
      header: 'Role',
      render: (u) => (
        <Select
          value={u.role}
          onValueChange={(r) => {
            if (r === u.role) return;
            if (r === 'EMPLOYEE') {
              setRoleTarget({ user: u, role: 'EMPLOYEE' });
              setIsVendor(null);
              setCompanyName(u.companyName ?? '');
              return;
            }
            change({ id: u._id, payload: { role: r } });
          }}
          disabled={u._id === (me?._id || me?.id)}
        >
          <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
          <SelectContent>{ROLES.map((r) => <SelectItem key={r} value={r}>{titleCase(r)}</SelectItem>)}</SelectContent>
        </Select>
      ),
    },
    {
      key: 'vendor',
      header: 'Vendor',
      render: (u) =>
        u.role === 'EMPLOYEE' ? (
          <span className={u.isVendor ? 'text-sm font-medium text-primary' : 'text-sm text-muted-foreground'}>
            {u.isVendor ? 'Vendor' : 'Employee'}
          </span>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    { key: 'company', header: 'Company', render: (u) => u.companyName || '—' },
    {
      key: 'status',
      header: 'Status',
      render: (u) => (
        <button
          type="button"
          onClick={() => change({ id: u._id, payload: { isActive: !u.isActive } })}
          disabled={u._id === (me?._id || me?.id)}
          className="disabled:opacity-60"
        >
          <StatusBadge label={u.isActive ? 'Active' : 'Disabled'} tone={u.isActive ? 'success' : 'danger'} />
        </button>
      ),
    },
    { key: 'joined', header: 'Joined', render: (u) => formatDate(u.createdAt) },
    {
      key: 'actions',
      header: '',
      render: (u) => (
        <Button size="icon-sm" variant="ghost" aria-label="View" onClick={() => setActive(u)}>
          <Eye className="size-3.5" />
        </Button>
      ),
    },
  ];

  return (
    <>
      <SEO title="Users" noindex />
      <div className="space-y-5">
        <div>
          <h1 className="text-xl font-bold">Users</h1>
          <p className="text-sm text-muted-foreground">Manage accounts, roles and access.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder="Search name or email…" className="h-8 w-60 pl-8" />
          </div>
          <Select value={role} onValueChange={(v) => { setRole(v); setPage(1); }}>
            <SelectTrigger className="h-8 w-40"><SelectValue placeholder="Role" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All roles</SelectItem>
              {ROLES.map((r) => <SelectItem key={r} value={r}>{titleCase(r)}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <DataTable columns={columns} rows={data?.data ?? []} rowKey={(u) => u._id} loading={isLoading} empty="No users match your filters." />

        {data && data.pagination.totalPages > 1 && (
          <Pagination page={data.pagination.page} totalPages={data.pagination.totalPages} onPageChange={setPage} />
        )}
      </div>

      <Dialog open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <DialogContent>
          {active && (
            <>
              <DialogHeader>
                <DialogTitle>{active.name}</DialogTitle>
                <DialogDescription>User account details</DialogDescription>
              </DialogHeader>
              <div className="flex items-center gap-3">
                <Avatar className="size-12">
                  {active.profileImage ? <AvatarImage src={active.profileImage} alt="" /> : null}
                  <AvatarFallback>{active.name?.slice(0, 1).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{active.name}</p>
                  <p className="text-xs text-muted-foreground">{active.email}</p>
                </div>
              </div>
              <Separator />
              <div className="grid gap-2 text-sm sm:grid-cols-2">
                <p>Role: {titleCase(active.role)}</p>
                <p>Vendor: {active.role === 'EMPLOYEE' ? (active.isVendor ? 'Yes' : 'No') : '—'}</p>
                <p>Company: {active.companyName || '—'}</p>
                <p>Phone: {active.phone || '—'}</p>
                <p>Email verified: {active.emailVerified ? 'Yes' : 'No'}</p>
                <p>Phone verified: {active.phoneVerified ? 'Yes' : 'No'}</p>
                <p>Status: {active.isActive ? 'Active' : 'Disabled'}</p>
                <p>Joined: {formatDate(active.createdAt)}</p>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setActive(null)}>Close</Button>
                <Button
                  variant={active.isActive ? 'destructive' : 'default'}
                  disabled={active._id === (me?._id || me?.id)}
                  onClick={() => change({ id: active._id, payload: { isActive: !active.isActive } })}
                >
                  {active.isActive ? 'Disable account' : 'Enable account'}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!roleTarget} onOpenChange={(o) => !o && setRoleTarget(null)}>
        <DialogContent>
          {roleTarget && (
            <>
              <DialogHeader>
                <DialogTitle>Make {roleTarget.user.name} an employee</DialogTitle>
                <DialogDescription>
                  Employees only see and manage the listings they create.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3">
                <div>
                  <Label>Is this employee a vendor?</Label>
                  <div className="mt-2 flex gap-2">
                    <Button
                      type="button"
                      variant={isVendor === true ? 'default' : 'outline'}
                      onClick={() => setIsVendor(true)}
                    >
                      Yes, vendor
                    </Button>
                    <Button
                      type="button"
                      variant={isVendor === false ? 'default' : 'outline'}
                      onClick={() => { setIsVendor(false); setCompanyName(''); }}
                    >
                      No, employee
                    </Button>
                  </div>
                </div>

                {isVendor && (
                  <div>
                    <Label htmlFor="company-name">Company name</Label>
                    <Input
                      id="company-name"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="e.g. Priya Motors"
                      className="mt-1.5 h-10"
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setRoleTarget(null)}>Cancel</Button>
                <Button
                  disabled={isVendor === null || (isVendor === true && !companyName.trim())}
                  onClick={() =>
                    change({
                      id: roleTarget.user._id,
                      payload: {
                        role: 'EMPLOYEE',
                        isVendor,
                        companyName: isVendor ? companyName.trim() : null,
                      },
                    })
                  }
                >
                  Save
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
