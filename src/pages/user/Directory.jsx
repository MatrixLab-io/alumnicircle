import { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { UsersIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import { PageHeader } from '../../components/layout';
import { Spinner, EmptyState } from '../../components/common';
import {
  SearchBar,
  SortDropdown,
  Pagination,
  MemberCard,
  MemberModal,
} from '../../components/directory';
import { getApprovedUsers } from '../../services/user.service';
import { debounce } from '../../utils/helpers';
import { APP_NAME, ITEMS_PER_PAGE } from '../../config/constants';

export default function Directory() {
  const { isAdmin } = useAuth();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedMember, setSelectedMember] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchMembers();
  }, [sortBy, sortOrder]);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const result = await getApprovedUsers({
        sortBy,
        sortOrder,
        pageSize: 100, // Fetch all for client-side filtering
      });
      setMembers(result.users);
    } catch (error) {
      console.error('Error fetching members:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter members based on search term
  const filteredMembers = useMemo(() => {
    if (!searchTerm) return members;
    const term = searchTerm.toLowerCase();
    return members.filter(
      (member) =>
        member.name?.toLowerCase().includes(term) ||
        member.email?.toLowerCase().includes(term) ||
        member.profession?.businessName?.toLowerCase().includes(term) ||
        member.profession?.companyName?.toLowerCase().includes(term) ||
        member.profession?.designation?.toLowerCase().includes(term) ||
        member.bloodGroup?.toLowerCase().includes(term)
    );
  }, [members, searchTerm]);

  // Paginate
  const totalPages = Math.ceil(filteredMembers.length / ITEMS_PER_PAGE);
  const paginatedMembers = filteredMembers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handleSort = (field, order) => {
    setSortBy(field);
    setSortOrder(order);
  };

  const handleMemberClick = (member) => {
    setSelectedMember(member);
    setIsModalOpen(true);
  };

  const debouncedSearch = useMemo(
    () => debounce((value) => setSearchTerm(value), 300),
    []
  );

  return (
    <>
      <Helmet>
        <title>Directory | {APP_NAME}</title>
      </Helmet>

      <PageHeader
        title="Member Directory"
        description={`${filteredMembers.length} alumni members`}
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search by name, email, profession..."
          className="flex-1"
        />
        <SortDropdown
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={handleSort}
        />
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : paginatedMembers.length === 0 ? (
        <EmptyState
          icon={<UsersIcon className="h-12 w-12" />}
          title="No members found"
          description={
            searchTerm
              ? 'Try adjusting your search terms'
              : 'No approved members yet'
          }
        />
      ) : (
        <>
          {/* Grid View */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {paginatedMembers.map((member) => (
              <MemberCard
                key={member.uid}
                member={member}
                onClick={handleMemberClick}
                isAdmin={isAdmin}
              />
            ))}
          </div>

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </>
      )}

      {/* Member Modal */}
      <MemberModal
        member={selectedMember}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        isAdmin={isAdmin}
      />
    </>
  );
}
