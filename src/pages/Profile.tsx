import moment from 'moment';
import UserImage from '../images/user/user-icon-member-login-isolated-vector.jpg';
import useLocalStorage from '../hooks/useLocalStorage';

const EMPTY = '—';

const formatDate = (value?: string) => {
  if (!value) return EMPTY;
  const parsed = moment(value, moment.ISO_8601);
  return parsed.isValid() ? parsed.format('DD MMM YYYY') : value;
};

const DetailRow = ({
  label,
  value,
}: {
  label: string;
  value?: React.ReactNode;
}) => (
  <div className="flex flex-col gap-1 border-b border-stroke py-4 last:border-b-0 dark:border-strokedark sm:flex-row sm:items-center sm:gap-4">
    <span className="text-sm font-medium sm:w-48 sm:shrink-0">{label}</span>
    <span className="break-words font-medium text-black dark:text-white">
      {value || EMPTY}
    </span>
  </div>
);

const Card = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
    <div className="border-b border-stroke px-6.5 py-4 dark:border-strokedark">
      <h3 className="font-medium text-black dark:text-white">{title}</h3>
    </div>
    <div className="px-6.5 py-2">{children}</div>
  </div>
);

const Profile = () => {
  const user = useLocalStorage('user', null)[0];
  const company = user?.company;

  const daysLeft = company?.expiryDate
    ? moment(company.expiryDate, moment.ISO_8601).diff(moment(), 'days')
    : null;
  const expired = daysLeft !== null && !Number.isNaN(daysLeft) && daysLeft < 0;

  return (
    <>
      <div className="mb-6 flex flex-col items-center gap-5 rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark sm:flex-row">
        <span className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-gray-300">
          <img
            src={UserImage}
            alt="Admin"
            className="h-full w-full object-cover"
          />
        </span>
        <div className="text-center sm:text-left">
          <h3 className="text-2xl font-semibold text-black dark:text-white">
            {user?.name || EMPTY}
          </h3>
          <p className="mt-1 font-medium">{user?.email || EMPTY}</p>
          <p className="mt-1 text-sm">{company?.companyName}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Card title="Admin Details">
          <DetailRow label="Name" value={user?.name} />
          <DetailRow label="Email" value={user?.email} />
        </Card>

        <Card title="Company Details">
          <DetailRow label="Company Name" value={company?.companyName} />
          <DetailRow label="Business Type" value={company?.businessType} />
          <DetailRow label="Phone Number" value={company?.phoneNumber} />
          <DetailRow
            label="Purchase Date"
            value={formatDate(company?.purchaseDate)}
          />
          <DetailRow
            label="Expiry Date"
            value={
              company?.expiryDate && (
                <>
                  {formatDate(company.expiryDate)}
                  {daysLeft !== null && !Number.isNaN(daysLeft) && (
                    <span
                      className={`ml-2 text-sm ${
                        expired ? 'text-danger' : 'text-success'
                      }`}
                    >
                      {expired
                        ? `(expired ${Math.abs(daysLeft)} days ago)`
                        : `(${daysLeft} days left)`}
                    </span>
                  )}
                </>
              )
            }
          />
          <DetailRow
            label="Status"
            value={
              company && (
                <span
                  className={`inline-flex rounded-full bg-opacity-10 px-3 py-1 text-sm font-medium ${
                    company.isActive
                      ? 'bg-success text-success'
                      : 'bg-danger text-danger'
                  }`}
                >
                  {company.isActive ? 'Active' : 'Inactive'}
                </span>
              )
            }
          />
        </Card>
      </div>
    </>
  );
};

export default Profile;
