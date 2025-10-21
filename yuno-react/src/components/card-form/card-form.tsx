import { useContext, useEffect, useRef } from "react";
import { AppContext } from "../../context/app-context";
import { Button } from "../button";
import { ContentForm } from "./card-form-styled";
import type { SecureFieldInstance } from "@yuno-payments/sdk-web-types";
export const CardForm = () => {
  const { checkoutSession, countryCode, yunoInstance } = useContext(AppContext);
  const renderedFlag = useRef(0);
  const secureFieldsInstance = useRef<SecureFieldInstance | null>(null);
  const generateOTT = async () => {
    const token = await secureFieldsInstance.current!.generateToken({
      cardHolderName: "Name Test",
      customer: {
        document: {
          document_number: "90209924",
          document_type: "CC",
        },
      },
    });
    console.log("token ----->", token);
  };

  const getInstanceSecureFields = async () => {
    if (!secureFieldsInstance.current) {
      secureFieldsInstance.current = await yunoInstance.secureFields({
        countryCode,
        checkoutSession,
      });
    }
    return secureFieldsInstance.current;
  };

  const renderSecureFields = async () => {
    await getInstanceSecureFields();
    const panFields = secureFieldsInstance.current!.create({
      name: "pan",
      options: {
        label: "pan",
        showError: true,
      },
    });

    const expirationFields = secureFieldsInstance.current!.create({
      name: "expiration",
      options: {
        label: "MM/YY",
        showError: true,
      },
    });

    const cvvFields = secureFieldsInstance.current!.create({
      name: "cvv",
      options: {
        label: "CVV",
        showError: true,
      },
    });

    panFields.render("#pan");
    expirationFields.render("#expiration");
    cvvFields.render("#cvv");
  };

  useEffect(() => {
    if (renderedFlag.current !== 0) {
      return;
    }
    renderedFlag.current = 1;
    renderSecureFields();
  }, []);

  return (
    <ContentForm>
      <div id="pan" />
      <div id="expiration" />
      <div id="cvv" />
      <Button onClick={generateOTT}>Pay</Button>
    </ContentForm>
  );
};
