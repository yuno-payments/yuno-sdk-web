/**
 * Split Checkout Demo — Vanilla JS
 *
 * Demonstrates the Split/Combo Payments feature using:
 *  - SplitMethodSelector for managing payment method slots
 *  - AmountAllocator for amount distribution (CUSTOMER_DEFINED mode)
 *  - CompositeOTTBuilder for packaging multiple OTTs
 *  - TransactionStatusTracker for real-time status polling
 */

import { getCheckoutSession, createPayment, getPublicApiKey } from './api.js'

// ---- Configuration ----
const SPLIT_CONFIG = {
  enabled: true,
  max_methods: 3,
  session_total: 2000, // matches default server amount
  currency: 'COP',
  allocation_mode: 'CUSTOMER_DEFINED',
}

// ---- State ----
const methodSlots = [] // { id, type, displayName, amount, ott }
let remainingAmount = SPLIT_CONFIG.session_total

// ---- DOM Helpers ----
function renderMethods() {
  const container = document.getElementById('methods-list')
  container.innerHTML = ''

  methodSlots.forEach((slot, index) => {
    const div = document.createElement('div')
    div.className = 'method-slot'
    div.innerHTML = `
      <h3>Method ${index + 1}: ${slot.displayName}</h3>
      <input
        class="amount-input"
        type="number"
        placeholder="Amount"
        value="${slot.amount || ''}"
        data-slot-index="${index}"
      />
      <button data-remove-index="${index}" style="margin-top:0.5rem;color:red;border:none;background:none;cursor:pointer;">Remove</button>
    `
    container.appendChild(div)
  })

  // Update remaining
  const sum = methodSlots.reduce((s, m) => s + (m.amount || 0), 0)
  remainingAmount = SPLIT_CONFIG.session_total - sum
  document.getElementById('remaining-amount').textContent = (remainingAmount / 100).toFixed(2)

  // Toggle add button
  const addBtn = document.getElementById('add-method-btn')
  addBtn.disabled = methodSlots.length >= SPLIT_CONFIG.max_methods

  // Attach event listeners
  container.querySelectorAll('.amount-input').forEach((input) => {
    input.addEventListener('change', (e) => {
      const idx = parseInt(e.target.dataset.slotIndex, 10)
      methodSlots[idx].amount = parseInt(e.target.value, 10) || 0
      renderMethods()
    })
  })

  container.querySelectorAll('[data-remove-index]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const idx = parseInt(e.target.dataset.removeIndex, 10)
      methodSlots.splice(idx, 1)
      renderMethods()
    })
  })
}

function renderStatuses(transactions) {
  const container = document.getElementById('status-tracker')
  container.innerHTML = ''

  transactions.forEach((tx) => {
    const div = document.createElement('div')
    div.className = 'method-slot'
    div.innerHTML = `
      <strong>${tx.payment_method_type}</strong> — $${(tx.amount / 100).toFixed(2)}
      <span class="status-badge status-${tx.status}">${tx.status}</span>
      ${tx.qr_code_data ? `<br><img src="${tx.qr_code_data}" alt="QR Code" width="120" />` : ''}
    `
    container.appendChild(div)
  })
}

// ---- Available payment method types (simulated) ----
const AVAILABLE_METHODS = [
  { type: 'CARD', name: 'Credit/Debit Card' },
  { type: 'PIX', name: 'PIX' },
  { type: 'NEQUI', name: 'Nequi' },
  { type: 'PSE', name: 'PSE' },
]

let methodPickerIndex = 0

// ---- Init ----
async function initSplitCheckout() {
  renderMethods()

  // Add method button
  document.getElementById('add-method-btn').addEventListener('click', () => {
    if (methodSlots.length >= SPLIT_CONFIG.max_methods) return

    const method = AVAILABLE_METHODS[methodPickerIndex % AVAILABLE_METHODS.length]
    methodPickerIndex++

    methodSlots.push({
      id: `slot_${Date.now()}`,
      type: method.type,
      displayName: method.name,
      amount: 0,
      ott: null,
    })
    renderMethods()
  })

  // Pay button
  document.getElementById('pay-split-btn').addEventListener('click', async () => {
    // Validate
    const sum = methodSlots.reduce((s, m) => s + (m.amount || 0), 0)
    if (sum !== SPLIT_CONFIG.session_total) {
      alert(`Amounts must sum to ${SPLIT_CONFIG.session_total}. Current sum: ${sum}`)
      return
    }

    if (methodSlots.length === 0) {
      alert('Add at least one payment method.')
      return
    }

    console.log('[SplitCheckout] Building composite OTT with allocations:', methodSlots)

    // In a real integration, each slot would have a real OTT from Yuno SDK.
    // Here we simulate the composite token structure.
    const compositeToken = {
      version: 2,
      composite_token: `cott_v2_${Date.now().toString(36)}`,
      allocations: methodSlots.map((s) => ({
        one_time_token: s.ott || `simulated_ott_${s.type}`,
        amount: s.amount,
        payment_method_type: s.type,
      })),
      total_amount: SPLIT_CONFIG.session_total,
      currency: SPLIT_CONFIG.currency,
      created_at: new Date().toISOString(),
    }

    console.log('[SplitCheckout] Composite OTT:', compositeToken)

    // Simulate transaction statuses
    const transactions = compositeToken.allocations.map((a) => ({
      one_time_token: a.one_time_token,
      payment_method_type: a.payment_method_type,
      amount: a.amount,
      status: a.payment_method_type === 'PIX' ? 'PENDING_ASYNC' : 'AUTHORIZED',
      qr_code_data: a.payment_method_type === 'PIX' ? 'data:image/png;base64,iVBORw0KGgo...' : undefined,
      updated_at: new Date().toISOString(),
    }))

    renderStatuses(transactions)

    // Simulate status updates after 2 seconds
    setTimeout(() => {
      const updatedTxs = transactions.map((tx) => ({
        ...tx,
        status: 'CAPTURED',
        updated_at: new Date().toISOString(),
      }))
      renderStatuses(updatedTxs)
      console.log('[SplitCheckout] All transactions captured.')
    }, 2000)
  })
}

// If Yuno SDK is loaded, wait for it; otherwise just init the demo UI
if (window.Yuno) {
  initSplitCheckout()
} else {
  window.addEventListener('yuno-sdk-ready', initSplitCheckout)
  // Also init immediately for demo purposes (SDK not strictly required for the demo)
  window.addEventListener('DOMContentLoaded', initSplitCheckout)
}
