import {
  Form,
} from '@edx/paragon';
import {
  useEffect, useMemo, useState,
} from 'react';
import { v4 as uuidv4 } from 'uuid';
import debounce from 'lodash.debounce';
import PROVISIONING_PAGE_TEXT from '../data/constants';
import { selectProvisioningContext } from '../data/utils';
import useProvisioningContext from '../data/hooks';

const ProvisioningFormCustomerDropdown = () => {
  const { ENTERPRISE_UUID } = PROVISIONING_PAGE_TEXT.FORM.CUSTOMER;
  const [formData, customers] = selectProvisioningContext('formData', 'customers');
  const { setCustomerUUID, getCustomers } = useProvisioningContext();
  const [selected, setSelected] = useState({ title: '' });
  const [dropdownValues, setDropdownValues] = useState([ENTERPRISE_UUID.DROPDOWN_DEFAULT]);
  const debouncedSearch = useMemo(() => debounce(getCustomers, 500, {
    leading: false,
  }), [formData.enterpriseUUID]);
  const handleOnSelected = (value) => {
    /* .includes('---') and .split(' --- ') are used to get the UUID from the
    dropdown value, and populate the customerUUID state */
    if (value && value.includes('---')) {
      const valueUuid = value.split(' --- ')[1].trim();
      setCustomerUUID(valueUuid);
    }
    setSelected(prevState => ({ selected: { ...prevState.selected, title: value } }));
  };
  const updateDropdownList = () => {
    if (customers.length > 0) {
      const options = customers.map(customer => `${customer.name} --- ${customer.id}`);
      setDropdownValues(options);
    }
  };
  const updateDropdown = (value) => {
    setCustomerUUID(value);
    if (value?.length === 0 || customers.length === 0) {
      return setDropdownValues(['No matching enterprise']);
    }
    return updateDropdownList();
  };
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      debouncedSearch(formData.enterpriseUUID);
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [formData.enterpriseUUID, debouncedSearch]);
  return (
    <Form.Autosuggest
      floatingLabel={ENTERPRISE_UUID.TITLE}
      value={selected.title}
      onSelected={handleOnSelected}
      onChange={updateDropdown}
      helpMessage={ENTERPRISE_UUID.SUB_TITLE}
      errorMessageText={ENTERPRISE_UUID.ERROR}
      data-testid="customer-uuid"
    >
      {dropdownValues.map(option => (
        <Form.AutosuggestOption key={uuidv4()}>
          {option}
        </Form.AutosuggestOption>
      ))}
    </Form.Autosuggest>
  );
};

export default ProvisioningFormCustomerDropdown;