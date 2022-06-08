import { FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "../../../components/links/Links";
import { LabelWithValue } from "../../../components/typography/TypographyHelpers";
import { trimAddress } from "../../../utils/strings";

type AddressLabelProps = {
  address: string;
  label?: string;
  url?: string;
};

export const AddressLabel: FunctionComponent<AddressLabelProps> = ({
  label,
  address,
  url,
}) => {
  const { t } = useTranslation();
  const resolvedLabel = label ? label : t("common.recipient-address-label");
  const Address = <span>{trimAddress(address, 5)}</span>;
  return (
    <LabelWithValue
      label={resolvedLabel}
      value={
        url ? (
          <Link href={url} color="primary" external externalPointer={false}>
            {Address}
          </Link>
        ) : (
          Address
        )
      }
    />
  );
};
