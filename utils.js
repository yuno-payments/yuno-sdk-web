exports.getCountryData = function getCountryData(country) {
  let countryData

  if (country == "CO") {
    countryData = {
      documentType: "CC",
      documentNumber: "1032765432",
      currency: "COP",
      amount: 2000,
    };
  } else if (country == "BR") {
    countryData = {
      documentType: "CPF",
      documentNumber: "351.040.753-97",
      currency: "BRL",
      amount: Math.floor(Math.random() * (1000 + 1) + 10),
    };
  } else if (country == "AR") {
    countryData = {
      documentType: "PASS",
      documentNumber: "123554332",
      currency: "ARS",
      amount: Math.floor(Math.random() * (1000 + 1) + 10),
    };
  } else if (country == "CL") {
    countryData = {
      documentType: "CI",
      documentNumber: "80209924",
      currency: "CLP",
      amount: Math.floor(Math.random() * (1000 + 1) + 10),
    };
  } else {
    countryData = {
      documentType: "PASS",
      documentNumber: "T12345",
      currency: "USD",
      amount: Math.floor(Math.random() * (1000 + 1) + 10),
    };
  }

  return countryData;
}