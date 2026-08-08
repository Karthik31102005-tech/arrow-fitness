// Maps each plan type to its duration in months
const PLAN_DURATIONS = {
    monthly: 1,
    '3month': 3,
    '6month': 6,
    '12month': 12
};

// Maps each plan type to its price in INR
const PLAN_PRICES = {
    monthly: 1000,
    '3month': 3000,
    '6month': 4500,
    '12month': 8000
};

const NEW_JOINING_FEE = 1000;

/**
 * Calculates the plan end date given a start date and plan type.
 * @param {Date} startDate - when the plan begins
 * @param {String} planType - 'monthly' | '3month' | '6month' | '12month'
 * @returns {Date} calculated end date
 */
function calculateEndDate(startDate, planType) {
    const months = PLAN_DURATIONS[planType];
    if (!months) {
        throw new Error(`Invalid plan type: ${planType}`);
    }

    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + months);

    return endDate;
}

/**
 * Calculates the total amount to charge for a registration.
 * @param {String} planType
 * @param {Boolean} isNewMember - true if this is a first-time registration
 * @returns {Number} total amount in INR
 */
function calculateAmount(planType, isNewMember = true) {
    const planPrice = PLAN_PRICES[planType];
    if (!planPrice) {
        throw new Error(`Invalid plan type: ${planType}`);
    }

    return isNewMember ? planPrice + NEW_JOINING_FEE : planPrice;
}

module.exports = {
    calculateEndDate,
    calculateAmount,
    PLAN_DURATIONS,
    PLAN_PRICES,
    NEW_JOINING_FEE
};