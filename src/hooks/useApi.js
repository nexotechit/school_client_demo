import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { API_BASE_URL } from '../../config/api';

// Generic API fetch function with caching
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  // Default headers
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  // Add cache-busting headers for non-GET requests to ensure immediate updates
  if (options.method && options.method !== 'GET') {
    headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
    headers['Pragma'] = 'no-cache';
    headers['Expires'] = '0';
  }
  
  const response = await fetch(url, {
    headers,
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Network error' }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
};

// Students Hooks
// NOTE: React Query sometimes relies on internal helpers when complex objects
// are used directly in query keys. stringify the filters into a stable string
// to avoid runtime bundler/serialization issues (and make keys deterministic).
const buildStableKey = (obj = {}) => {
  if (!obj || Object.keys(obj).length === 0) return undefined;
  const sorted = Object.keys(obj).sort().reduce((acc, k) => {
    acc[k] = obj[k];
    return acc;
  }, {});
  try {
    return JSON.stringify(sorted);
  } catch (err) {
    // Fallback to a simple string representation
    return String(sorted);
  }
};

export const useStudents = (filters = {}) => {
  const filterKey = buildStableKey(filters);
  const queryKey = filterKey ? ['students', filterKey] : ['students'];

  return useQuery({
    queryKey,
    queryFn: () => {
      const params = new URLSearchParams(filters).toString();
      return apiRequest(`/students${params ? `?${params}` : ''}`);
    },
    staleTime: 0,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
};



export const useStudent = (id) => {
  return useQuery({
    queryKey: ['student', id],
    queryFn: () => apiRequest(`/students/${id}`),
    enabled: !!id,
    staleTime: 0,
    // refetchOnWindowFocus: true,
  });
};

export const useCreateStudent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (studentData) => apiRequest('/students', {
      method: 'POST',
      body: JSON.stringify(studentData),
    }),
    onSuccess: (response) => {
      const newStudent = response?.data;
      if (newStudent) {
        // Immediately add student to cache — no wait for network round-trip
        queryClient.setQueryData(['students'], (old) => {
          if (!old) return { success: true, count: 1, data: [newStudent] };
          const existingData = old?.data || [];
          return { ...old, count: existingData.length + 1, data: [...existingData, newStudent] };
        });
      }
      // Background sync to ensure server consistency
      queryClient.invalidateQueries({ queryKey: ['students'] });
    },
  });
};

export const useUpdateStudent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }) => apiRequest(`/students/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    onSuccess: (response, variables) => {
      const updatedStudent = response?.data;
      if (updatedStudent) {
        // Immediately update the student in cache
        queryClient.setQueryData(['students'], (old) => {
          if (!old?.data) return old;
          return { ...old, data: old.data.map(s => s._id === variables.id ? updatedStudent : s) };
        });
        queryClient.setQueryData(['student', variables.id], (old) => {
          if (!old) return old;
          return { ...old, data: updatedStudent };
        });
      }
      queryClient.invalidateQueries({ queryKey: ['students'] });
      queryClient.invalidateQueries({ queryKey: ['student', variables.id] });
    },
  });
};

export const useDeleteStudent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => apiRequest(`/students/${id}`, {
      method: 'DELETE',
    }),
    onSuccess: (response, id) => {
      // Immediately remove student from cache
      queryClient.setQueryData(['students'], (old) => {
        if (!old?.data) return old;
        const filtered = old.data.filter(s => String(s._id) !== String(id));
        return { ...old, count: filtered.length, data: filtered };
      });
      queryClient.invalidateQueries({ queryKey: ['students'] });
    },
  });
};

// Teachers Hooks
export const useTeachers = () => {
  return useQuery({
    queryKey: ['teachers'],
    queryFn: () => apiRequest('/teachers'),
    staleTime: 0,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
};

export const useTeacher = (id) => {
  return useQuery({
    queryKey: ['teacher', id],
    queryFn: () => apiRequest(`/teachers/${id}`),
    enabled: !!id,
    staleTime: 0,
    refetchOnWindowFocus: true,
  });
};

export const useCreateTeacher = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (teacherData) => apiRequest('/teachers', {
      method: 'POST',
      body: JSON.stringify(teacherData),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teachers'], refetchType: 'active' });
    },
  });
};

export const useUpdateTeacher = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }) => apiRequest(`/teachers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['teachers'], refetchType: 'active' });
      queryClient.invalidateQueries({ queryKey: ['teacher', variables.id], refetchType: 'active' });
    },
  });
};

export const useDeleteTeacher = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => apiRequest(`/teachers/${id}`, {
      method: 'DELETE',
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teachers'], refetchType: 'active' });
    },
  });
};

// Salaries Hooks
export const useSalaries = (filters = {}) => {
  // Create a stable query key from filters
  const filterKey = buildStableKey(filters);
  const queryKey = filterKey ? ['salaries', filterKey] : ['salaries'];

  return useQuery({
    queryKey,
    queryFn: () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== '' && value !== null && value !== undefined) {
          params.append(key, value);
        }
      });
      params.append('limit', '1000'); // Increased limit to ensure all records are fetched
      params.append('page', '1'); // Ensure we're getting the first page
      params.append('sort', '-createdAt');

      return apiRequest(`/salaries?${params.toString()}`);
    },
    staleTime: 0, // Always fetch fresh data
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
};

export const useSalary = (id) => {
  return useQuery({
    queryKey: ['salary', id],
    queryFn: () => apiRequest(`/salaries/${id}`),
    enabled: !!id,
    staleTime: 0,
    refetchOnWindowFocus: true,
  });
};

export const useSalaryStatistics = (filters = {}) => {
  const filterKey = buildStableKey(filters);
  const queryKey = filterKey ? ['salary-statistics', filterKey] : ['salary-statistics'];

  return useQuery({
    queryKey,
    queryFn: () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== '' && value !== null && value !== undefined) {
          params.append(key, value);
        }
      });
      return apiRequest(`/salaries/statistics?${params.toString()}`);
    },
    staleTime: 0,
    refetchOnWindowFocus: true,
  });
};

export const useCreateSalary = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (salaryData) => apiRequest('/salaries', {
      method: 'POST',
      body: JSON.stringify(salaryData),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salaries'], refetchType: 'active' });
      queryClient.invalidateQueries({ queryKey: ['salary-statistics'], refetchType: 'active' });
    },
  });
};

export const useUpdateSalary = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }) => apiRequest(`/salaries/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['salaries'], refetchType: 'active' });
      queryClient.invalidateQueries({ queryKey: ['salary', variables.id], refetchType: 'active' });
      queryClient.invalidateQueries({ queryKey: ['salary-statistics'], refetchType: 'active' });
    },
  });
};

export const useDeleteSalary = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => apiRequest(`/salaries/${id}`, {
      method: 'DELETE',
    }),
    onMutate: async (id) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['salaries'] });

      // Snapshot the previous value
      const previousSalaries = queryClient.getQueryData(['salaries']);

      // Optimistically update to the new value
      queryClient.setQueryData(['salaries'], (old) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: old.data.filter(salary => salary._id !== id)
        };
      });

      return { previousSalaries };
    },
    onError: (err, id, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousSalaries) {
        queryClient.setQueryData(['salaries'], context.previousSalaries);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salaries'], refetchType: 'active' });
      queryClient.invalidateQueries({ queryKey: ['salary-statistics'], refetchType: 'active' });
    },
  });
};

// Notices Hooks
export const useNotices = () => {
  return useQuery({
    queryKey: ['notices'],
    queryFn: () => apiRequest('/notices'),
    staleTime: 0,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
};

export const useCreateNotice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (noticeData) => apiRequest('/notices', {
      method: 'POST',
      body: JSON.stringify(noticeData),
    }),
    onSuccess: (response) => {
      const newNotice = response?.data;
      if (newNotice) {
        queryClient.setQueryData(['notices'], (old) => {
          if (!old) return { success: true, data: [newNotice] };
          return { ...old, data: [newNotice, ...(old.data || [])] };
        });
      }
      queryClient.invalidateQueries({ queryKey: ['notices'] });
    },
  });
};

export const useUpdateNotice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }) => apiRequest(`/notices/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    onSuccess: (response, variables) => {
      const updated = response?.data;
      if (updated) {
        queryClient.setQueryData(['notices'], (old) => {
          if (!old?.data) return old;
          return { ...old, data: old.data.map(n => n._id === variables.id ? updated : n) };
        });
      }
      queryClient.invalidateQueries({ queryKey: ['notices'] });
    },
  });
};

export const useDeleteNotice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => apiRequest(`/notices/${id}`, { method: 'DELETE' }),
    onSuccess: (response, id) => {
      queryClient.setQueryData(['notices'], (old) => {
        if (!old?.data) return old;
        const filtered = old.data.filter(n => String(n._id) !== String(id));
        return { ...old, count: filtered.length, data: filtered };
      });
      queryClient.invalidateQueries({ queryKey: ['notices'] });
    },
  });
};

// Facilities Hooks
export const useFacilities = () => {
  return useQuery({
    queryKey: ['facilities'],
    queryFn: () => apiRequest('/facilities'),
    staleTime: 0,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
};

export const useCreateFacility = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => apiRequest('/facilities', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: (response) => {
      const item = response?.data;
      if (item) {
        queryClient.setQueryData(['facilities'], (old) => {
          if (!old) return { success: true, data: [item] };
          return { ...old, count: (old.count || 0) + 1, data: [...(old.data || []), item] };
        });
      }
      queryClient.invalidateQueries({ queryKey: ['facilities'] });
    },
  });
};

export const useUpdateFacility = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }) => apiRequest(`/facilities/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    onSuccess: (response, variables) => {
      const updated = response?.data;
      if (updated) {
        queryClient.setQueryData(['facilities'], (old) => {
          if (!old?.data) return old;
          return { ...old, data: old.data.map(f => f._id === variables.id ? updated : f) };
        });
      }
      queryClient.invalidateQueries({ queryKey: ['facilities'] });
    },
  });
};

export const useDeleteFacility = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => apiRequest(`/facilities/${id}`, { method: 'DELETE' }),
    onSuccess: (response, id) => {
      queryClient.setQueryData(['facilities'], (old) => {
        if (!old?.data) return old;
        const filtered = old.data.filter(f => String(f._id) !== String(id));
        return { ...old, count: filtered.length, data: filtered };
      });
      queryClient.invalidateQueries({ queryKey: ['facilities'] });
    },
  });
};

// Academics Hooks
export const useAcademics = (filters = {}) => {
  const filterKey = buildStableKey(filters);
  const queryKey = filterKey ? ['academics', filterKey] : ['academics'];
  return useQuery({
    queryKey,
    queryFn: () => {
      const params = new URLSearchParams(filters).toString();
      return apiRequest(`/academics${params ? `?${params}` : ''}`);
    },
    staleTime: 0,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
};

export const useCreateAcademic = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => apiRequest('/academics', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: (response) => {
      const item = response?.data;
      if (item) {
        queryClient.setQueryData(['academics'], (old) => {
          if (!old) return { success: true, data: [item] };
          return { ...old, count: (old.count || 0) + 1, data: [...(old.data || []), item] };
        });
      }
      queryClient.invalidateQueries({ queryKey: ['academics'] });
    },
  });
};

export const useUpdateAcademic = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }) => apiRequest(`/academics/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    onSuccess: (response, variables) => {
      const updated = response?.data;
      if (updated) {
        queryClient.setQueryData(['academics'], (old) => {
          if (!old?.data) return old;
          return { ...old, data: old.data.map(a => a._id === variables.id ? updated : a) };
        });
      }
      queryClient.invalidateQueries({ queryKey: ['academics'] });
    },
  });
};

export const useDeleteAcademic = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => apiRequest(`/academics/${id}`, { method: 'DELETE' }),
    onSuccess: (response, id) => {
      queryClient.setQueryData(['academics'], (old) => {
        if (!old?.data) return old;
        const filtered = old.data.filter(a => String(a._id) !== String(id));
        return { ...old, count: filtered.length, data: filtered };
      });
      queryClient.invalidateQueries({ queryKey: ['academics'] });
    },
  });
};

// Achievements Hooks
export const useAchievements = () => {
  return useQuery({
    queryKey: ['achievements'],
    queryFn: () => apiRequest('/achievements'),
    staleTime: 0,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
};

export const useCreateAchievement = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => apiRequest('/achievements', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: (response) => {
      const item = response?.data;
      if (item) {
        queryClient.setQueryData(['achievements'], (old) => {
          if (!old) return { success: true, data: [item] };
          return { ...old, count: (old.count || 0) + 1, data: [...(old.data || []), item] };
        });
      }
      queryClient.invalidateQueries({ queryKey: ['achievements'] });
    },
  });
};

export const useUpdateAchievement = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }) => apiRequest(`/achievements/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    onSuccess: (response, variables) => {
      const updated = response?.data;
      if (updated) {
        queryClient.setQueryData(['achievements'], (old) => {
          if (!old?.data) return old;
          return { ...old, data: old.data.map(a => a._id === variables.id ? updated : a) };
        });
      }
      queryClient.invalidateQueries({ queryKey: ['achievements'] });
    },
  });
};

export const useDeleteAchievement = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => apiRequest(`/achievements/${id}`, { method: 'DELETE' }),
    onSuccess: (response, id) => {
      queryClient.setQueryData(['achievements'], (old) => {
        if (!old?.data) return old;
        const filtered = old.data.filter(a => String(a._id) !== String(id));
        return { ...old, count: filtered.length, data: filtered };
      });
      queryClient.invalidateQueries({ queryKey: ['achievements'] });
    },
  });
};

// Results/Exams Hooks
export const useResults = (filters = {}) => {
  const filterKey = buildStableKey(filters);
  const queryKey = filterKey ? ['results', filterKey] : ['results'];

  return useQuery({
    queryKey,
    queryFn: () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      return apiRequest(`/results?${params.toString()}`);
    },
    staleTime: 0,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
  });
};

export const useCreateResult = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (resultData) => apiRequest('/results', {
      method: 'POST',
      body: JSON.stringify(resultData),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['results'], refetchType: 'active' });
    },
  });
};

// Fees Hooks
export const useFees = (filters = {}) => {
  const filterKey = buildStableKey(filters);
  const queryKey = filterKey ? ['fees', filterKey] : ['fees'];

  return useQuery({
    queryKey,
    queryFn: () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      return apiRequest(`/fees?${params.toString()}`);
    },
    staleTime: 0,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
  });
};

export const useCreateFee = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (feeData) => apiRequest('/fees', {
      method: 'POST',
      body: JSON.stringify(feeData),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fees'], refetchType: 'active' });
    },
  });
};

// Expenses Hooks
export const useExpenses = (filters = {}) => {
  const filterKey = buildStableKey(filters);
  const queryKey = filterKey ? ['expenses', filterKey] : ['expenses'];

  return useQuery({
    queryKey,
    queryFn: () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      return apiRequest(`/expenses?${params.toString()}`);
    },
    staleTime: 0,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
  });
};

export const useCreateExpense = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (expenseData) => apiRequest('/expenses', {
      method: 'POST',
      body: JSON.stringify(expenseData),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'], refetchType: 'active' });
    },
  });
};

export const useApproveSalary = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => apiRequest(`/salaries/${id}/approve`, {
      method: 'PUT',
      body: JSON.stringify({ approvedBy: 'Admin' }),
    }),
    onMutate: async (id) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['salaries'] });

      // Snapshot the previous value
      const previousSalaries = queryClient.getQueryData(['salaries']);

      // Optimistically update to the new value
      queryClient.setQueryData(['salaries'], (old) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: old.data.map(salary =>
            salary._id === id
              ? { ...salary, status: 'Approved', approvedDate: new Date(), approvedBy: 'Admin' }
              : salary
          )
        };
      });

      return { previousSalaries };
    },
    onError: (err, id, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousSalaries) {
        queryClient.setQueryData(['salaries'], context.previousSalaries);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salaries'], refetchType: 'active' });
      queryClient.invalidateQueries({ queryKey: ['salary-statistics'], refetchType: 'active' });
    },
  });
};

export const useRejectSalary = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }) => apiRequest(`/salaries/${id}/reject`, {
      method: 'PUT',
      body: JSON.stringify({ rejectionReason: reason, rejectedBy: 'Admin' }),
    }),
    onMutate: async ({ id, reason }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['salaries'] });

      // Snapshot the previous value
      const previousSalaries = queryClient.getQueryData(['salaries']);

      // Optimistically update to the new value
      queryClient.setQueryData(['salaries'], (old) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: old.data.map(salary =>
            salary._id === id
              ? { ...salary, status: 'Rejected', rejectionReason: reason, rejectedBy: 'Admin' }
              : salary
          )
        };
      });

      return { previousSalaries };
    },
    onError: (err, variables, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousSalaries) {
        queryClient.setQueryData(['salaries'], context.previousSalaries);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salaries'], refetchType: 'active' });
      queryClient.invalidateQueries({ queryKey: ['salary-statistics'], refetchType: 'active' });
    },
  });
};

export const useMarkSalaryAsPaid = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => apiRequest(`/salaries/${id}/mark-paid`, {
      method: 'PUT',
      body: JSON.stringify({ paymentDate: new Date() }),
    }),
    onMutate: async (id) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['salaries'] });

      // Snapshot the previous value
      const previousSalaries = queryClient.getQueryData(['salaries']);

      // Optimistically update to the new value
      queryClient.setQueryData(['salaries'], (old) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: old.data.map(salary =>
            salary._id === id
              ? { ...salary, status: 'Paid', paidDate: new Date(), paidBy: 'Admin' }
              : salary
          )
        };
      });

      return { previousSalaries };
    },
    onError: (err, id, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousSalaries) {
        queryClient.setQueryData(['salaries'], context.previousSalaries);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salaries'], refetchType: 'active' });
      queryClient.invalidateQueries({ queryKey: ['salary-statistics'], refetchType: 'active' });
    },
  });
};

export const useBulkApproveSalaries = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (salaryIds) => apiRequest('/salaries/bulk/approve', {
      method: 'POST',
      body: JSON.stringify({ salaryIds, approvedBy: 'Admin' }),
    }),
    onMutate: async (salaryIds) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['salaries'] });

      // Snapshot the previous value
      const previousSalaries = queryClient.getQueryData(['salaries']);

      // Optimistically update to the new value
      queryClient.setQueryData(['salaries'], (old) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: old.data.map(salary =>
            salaryIds.includes(salary._id)
              ? { ...salary, status: 'Approved', approvedDate: new Date(), approvedBy: 'Admin' }
              : salary
          )
        };
      });

      return { previousSalaries };
    },
    onError: (err, salaryIds, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousSalaries) {
        queryClient.setQueryData(['salaries'], context.previousSalaries);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salaries'], refetchType: 'active' });
      queryClient.invalidateQueries({ queryKey: ['salary-statistics'], refetchType: 'active' });
    },
  });
};

export const useBulkDeleteSalaries = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (salaryIds) => apiRequest('/salaries/bulk/delete', {
      method: 'POST',
      body: JSON.stringify({ salaryIds }),
    }),
    onMutate: async (salaryIds) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['salaries'] });

      // Snapshot the previous value
      const previousSalaries = queryClient.getQueryData(['salaries']);

      // Optimistically update to the new value
      queryClient.setQueryData(['salaries'], (old) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: old.data.filter(salary => !salaryIds.includes(salary._id))
        };
      });

      return { previousSalaries };
    },
    onError: (err, salaryIds, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousSalaries) {
        queryClient.setQueryData(['salaries'], context.previousSalaries);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salaries'], refetchType: 'active' });
      queryClient.invalidateQueries({ queryKey: ['salary-statistics'], refetchType: 'active' });
    },
  });
};

// Prefetch functions for better UX
export const prefetchSalaries = async (queryClient) => {
  await queryClient.prefetchQuery({
    queryKey: ['salaries'],
    queryFn: () => apiRequest('/salaries'),
    staleTime: 0, // Fetch fresh data
  });
};

// Gallery Hooks
export const useGallery = () => {
  return useQuery({
    queryKey: ['gallery'],
    queryFn: () => apiRequest('/gallery'),
    staleTime: 0,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
};

export const useCreateGallery = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => apiRequest('/gallery', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: (response) => {
      const item = response?.data;
      if (item) {
        queryClient.setQueryData(['gallery'], (old) => {
          if (!old) return { success: true, data: [item] };
          return { ...old, count: (old.count || 0) + 1, data: [...(old.data || []), item] };
        });
      }
      queryClient.invalidateQueries({ queryKey: ['gallery'] });
    },
  });
};

export const useUpdateGallery = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }) => apiRequest(`/gallery/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    onSuccess: (response, variables) => {
      const updated = response?.data;
      if (updated) {
        queryClient.setQueryData(['gallery'], (old) => {
          if (!old?.data) return old;
          return { ...old, data: old.data.map(g => g._id === variables.id ? updated : g) };
        });
      }
      queryClient.invalidateQueries({ queryKey: ['gallery'] });
    },
  });
};

export const useDeleteGallery = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => apiRequest(`/gallery/${id}`, { method: 'DELETE' }),
    onSuccess: (response, id) => {
      queryClient.setQueryData(['gallery'], (old) => {
        if (!old?.data) return old;
        const filtered = old.data.filter(g => String(g._id) !== String(id));
        return { ...old, count: filtered.length, data: filtered };
      });
      queryClient.invalidateQueries({ queryKey: ['gallery'] });
    },
  });
};

// Banner Hooks
export const useBanners = () => {
  return useQuery({
    queryKey: ['banners'],
    queryFn: () => apiRequest('/banners'),
    staleTime: 0,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
};

export const useCreateBanner = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => apiRequest('/banners', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: (response) => {
      const item = response?.data;
      if (item) {
        queryClient.setQueryData(['banners'], (old) => {
          if (!old) return { success: true, data: [item] };
          return { ...old, count: (old.count || 0) + 1, data: [...(old.data || []), item] };
        });
      }
      queryClient.invalidateQueries({ queryKey: ['banners'] });
    },
  });
};

export const useUpdateBanner = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }) => apiRequest(`/banners/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    onSuccess: (response, variables) => {
      const updated = response?.data;
      if (updated) {
        queryClient.setQueryData(['banners'], (old) => {
          if (!old?.data) return old;
          return { ...old, data: old.data.map(b => b._id === variables.id ? updated : b) };
        });
      }
      queryClient.invalidateQueries({ queryKey: ['banners'] });
    },
  });
};

export const useDeleteBanner = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => apiRequest(`/banners/${id}`, { method: 'DELETE' }),
    onSuccess: (response, id) => {
      queryClient.setQueryData(['banners'], (old) => {
        if (!old?.data) return old;
        const filtered = old.data.filter(b => String(b._id) !== String(id));
        return { ...old, count: filtered.length, data: filtered };
      });
      queryClient.invalidateQueries({ queryKey: ['banners'] });
    },
  });
};

export const prefetchStudents = async (queryClient) => {
  await queryClient.prefetchQuery({
    queryKey: ['students'],
    queryFn: () => apiRequest('/students'),
    staleTime: 0, // Fetch fresh data
  });
};

export const prefetchTeachers = async (queryClient) => {
  await queryClient.prefetchQuery({
    queryKey: ['teachers'],
    queryFn: () => apiRequest('/teachers'),
    staleTime: 0, // Fetch fresh data
  });
};