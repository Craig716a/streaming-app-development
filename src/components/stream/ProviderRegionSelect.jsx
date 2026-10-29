import { ChevronDown } from 'lucide-react';
import { useProviderRegions } from '@/hooks/useTmdb';

export default function ProviderRegionSelect({ value, onChange, label = 'Available in', className = 'provider-region-select' }) {
  const regions = useProviderRegions();
  const fallbackName = regions.data?.find((region) => region.iso3166_1 === value)?.englishName || value;

  return (
    <label className={className}>
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} aria-label="Select streaming availability region">
        {(regions.data || []).map((region) => (
          <option key={region.iso3166_1} value={region.iso3166_1}>
            {region.englishName}
          </option>
        ))}
        {regions.data && !regions.data.some((region) => region.iso3166_1 === value) ? <option value={value}>{fallbackName}</option> : null}
      </select>
      <ChevronDown size={14} />
    </label>
  );
}