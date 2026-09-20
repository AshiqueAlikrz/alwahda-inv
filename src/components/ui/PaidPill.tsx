import { IoCheckmarkCircle, IoTimeOutline } from 'react-icons/io5';

// icon + label, so the state never relies on colour alone
const PaidPill = ({ paid }: { paid: boolean }) =>
  paid ? (
    <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2.5 py-0.5 text-xs font-medium text-success">
      <IoCheckmarkCircle size={14} />
      Paid
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-full bg-warning/10 px-2.5 py-0.5 text-xs font-medium text-[#B45309]">
      <IoTimeOutline size={14} />
      Unpaid
    </span>
  );

export default PaidPill;
