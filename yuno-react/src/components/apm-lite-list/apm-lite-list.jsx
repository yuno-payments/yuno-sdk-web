/* eslint-disable react/prop-types */
import { useState } from "react"
import { RadioButton } from "../radio-button";
import { Content } from "./apm-lite-list-styled";
import { CardForm } from '../card-form'
import { ApmLite } from '../apm-lite'
import { ApmLiteCustomLoader } from '../apm-lite-custom-loader'

export const ApmListLite = ({ customLoader }) => {
  const [pmSelected, setPmSelected] = useState('CARD');
  const isCARD = pmSelected === 'CARD';
  const isPSE = pmSelected === 'PSE';
  const isADDI = pmSelected === 'ADDI';

  const ComponentApmLite = customLoader ? ApmLiteCustomLoader : ApmLite

  return <Content>
    <div>
      <RadioButton
        checked={isCARD}
        text={'CARD'}
        onClick={() => { setPmSelected('CARD') }}
      />
      <br />
      {isCARD && <CardForm />}
    </div>
    <div>
      <RadioButton
        checked={isPSE}
        text={'PSE'}
        onClick={() => { setPmSelected('PSE') }}
      />
      {isPSE && <ComponentApmLite paymentMethodType={'PSE'} onClose={() => { setPmSelected('') }} />}
    </div>
    <div>
      <RadioButton
        checked={isADDI}
        text={'ADDI'}
        onClick={() => { setPmSelected('ADDI') }}
      />
      {isADDI && <ComponentApmLite paymentMethodType={'ADDI'} onClose={() => { setPmSelected('') }} />}
    </div>
  </Content>
}