'use client';
export const dynamic = 'force-dynamic';

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";
import api from "@/lib/axios";
import ApproveModal from "@/components/ApproveModal";

interface Request {
  id: string;
  type: string;
  status: string;
  created_at: string;
  subtype?: string;
  custom_course_title?: string;
  course_name?: string;
  user_name?: string;
}

type RequestType = "leave" | "statement" | "course";

interface FilterState {
  requestType: string;
  status: string;
  date: string;
  page: number;
}

interface RequestsState {
  leaveRequests: Request[];
  statementRequests: Request[];
  courseRequests: Request[];
}

export default function HRRequestPage() {
  const router = useRouter();

  const [filter, setFilter] = useState<FilterState>({
    requestType: "",
    status: "",
    date: "",
    page: 1,
  });

  const [requests, setRequests] = useState<RequestsState>({
    leaveRequests: [],
    statementRequests: [],
    courseRequests: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [approveType, setApproveType] = useState<RequestType>("leave");
  const [approveId, setApproveId] = useState<string>("");

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFilter({ ...filter, [e.target.name]: e.target.value });
  };

  const fetchRequests = async (filters: FilterState) => {
    setLoading(true);
    setError(null);

    try {
      const params: Record<string, string> = {};
      if (filters.requestType) params.type = filters.requestType;
      if (filters.status) params.status = filters.status;
      if (filters.date) params.date = filters.date;

      const response = await api.get("/requests/all", { params });
      const data = response.data;

      setRequests({
        leaveRequests: Array.isArray(data.leaveRequests) ? data.leaveRequests : [],
        statementRequests: Array.isArray(data.statementRequests) ? data.statementRequests : [],
        courseRequests: Array.isArray(data.courseRequests) ? data.courseRequests : [],
      });
    } catch {
      setError("حدث خطأ أثناء الاتصال بالسيرفر.");
      setRequests({ leaveRequests: [], statementRequests: [], courseRequests: [] });
    } finally {
      setLoading(false);
    }
  };

  const debounce = <T extends (...args: any[]) => void>(func: T, wait: number) => {
    let timeout: ReturnType<typeof setTimeout>;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  };

  const debouncedFetchRequests = useCallback(debounce(fetchRequests, 500), []);
  useEffect(() => {
    debouncedFetchRequests(filter);
  }, [filter, debouncedFetchRequests]);

  const handleApprove = async (id: string, type: RequestType) => {
    if (type === "leave") {
      await api.post(`/${type}-requests/${id}/approve`, { status: "approved" });
      fetchRequests(filter);
    } else {
      setApproveId(id);
      setApproveType(type);
      setModalOpen(true);
    }
  };

  const handleReject = async (id: string, type: RequestType) => {
    const comment = prompt("سبب الرفض؟");
    if (!comment) return;

    const endpoint = type === "leave"
      ? `/${type}-requests/${id}/approve`
      : `/${type}-requests/${id}/reject`;

    const payload = type === "leave" ? { status: "rejected", comment } : { comment };

    try {
      await api.post(endpoint, payload);
      fetchRequests(filter);
    } catch (err) {
      alert("فشل في رفض الطلب، تحقق من الخادم.");
      console.error(err);
    }
  };

  const handleDelete = async (id: string, type: RequestType) => {
    if (!confirm("هل أنت متأكد من الحذف؟")) return;
    await api.delete(`/${type}-requests/${id}`);
    fetchRequests(filter);
  };

  const handleShowDetails = (id: string, type: RequestType) => {
    router.push(`/hr/requests/details/${type}/${id}`);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <h2 className="text-3xl font-bold text-gray-800">إدارة الطلبات</h2>

      <div className="bg-white rounded-2xl shadow p-4 md:p-6 border">
        <h3 className="text-xl font-semibold text-gray-700 mb-4">فلترة الطلبات</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select name="requestType" value={filter.requestType} onChange={handleFilterChange} className="p-2 border rounded-lg text-sm">
            <option value="">نوع الطلب</option>
            <option value="leave">إجازة</option>
            <option value="statement">بيان</option>
            <option value="course">دورة</option>
          </select>

          <select name="status" value={filter.status} onChange={handleFilterChange} className="p-2 border rounded-lg text-sm">
            <option value="">الحالة</option>
            <option value="pending">قيد المراجعة</option>
            <option value="approved">موافق</option>
            <option value="rejected">مرفوض</option>
          </select>

          <input type="date" name="date" value={filter.date} onChange={handleFilterChange} className="p-2 border rounded-lg text-sm" />
        </div>
      </div>

      {loading && <p className="text-blue-600 font-medium">جاري التحميل...</p>}
      {error && <p className="text-red-500 font-medium">{error}</p>}

      <div className="overflow-x-auto bg-white shadow rounded-2xl border">
        <table className="w-full text-sm text-gray-700">
          <thead className="bg-gray-100 text-gray-800">
            <tr>
              <th className="px-4 py-3 text-start">نوع الطلب</th>
              <th className="px-4 py-3 text-start">الحالة</th>
              <th className="px-4 py-3 text-start">التاريخ</th>
              <th className="px-4 py-3 text-start">المستخدم</th>
              <th className="px-4 py-3 text-start">الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {requests.leaveRequests.map((r) => (
              <tr key={r.id}><td>{r.subtype}</td></tr>
            ))}
            {requests.statementRequests.map((r) => (
              <tr key={r.id}><td>{r.subtype}</td></tr>
            ))}
            {requests.courseRequests.map((r) => (
              <tr key={r.id}><td>{r.course_name || r.custom_course_title}</td></tr>
            ))}
          </tbody>
        </table>
      </div>

      <ApproveModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        requestId={approveId}
        type={approveType}
        onSuccess={() => {
          setModalOpen(false);
          fetchRequests(filter);
        }}
      />
    </div>
  );
}
