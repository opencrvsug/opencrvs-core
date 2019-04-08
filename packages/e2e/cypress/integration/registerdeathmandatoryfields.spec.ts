/// <reference types="Cypress" />

context('Register', () => {
  beforeEach(() => {
    cy.login('fieldWorker')
  })

  it('fills in all data into the register form', () => {
    cy.visit(`${Cypress.env('REGISTER_URL')}events`)

    cy.wait(5000)

    // Vital Event Death Selected

    cy.get('#select_death_event')
      .should('be.visible')
      .click()

    cy.wait(2000)
    //cy.get('#select_death_event').click()

    cy.selectOption('#iDType', 'National ID', 'National ID')
    cy.get('#iD').type('1020607910288')
    //cy.get('#firstNames').type('ক ম আব্দুল্লাহ আল আমিন ')
    cy.get('#familyName').type('খান')

    //cy.get('#firstNamesEng').type('K M Abdullah al amin')
    cy.get('#familyNameEng').type('Khan')
    cy.selectOption('#gender', 'Male', 'Male')
    //cy.selectOption('#maritalStatus', 'Married', 'Married')
    cy.get('#birthDate-dd').type('16')
    cy.get('#birthDate-mm').type('06')
    cy.get('#birthDate-yyyy').type('1988')

    //cy.selectOption('#countryPermanent', 'Bangladesh', 'Bangladesh')
    cy.selectOption('#statePermanent', 'Dhaka', 'Dhaka')
    cy.selectOption('#districtPermanent', 'Gazipur', 'Gazipur')
    cy.selectOption('#addressLine4Permanent', 'Kaliganj', 'Kaliganj')
    cy.selectOption('#addressLine3Permanent', 'Bahadursadi', 'Bahadursadi')
    // cy.get('#addressLine2Permanent').type('Bahadur street')
    // cy.get('#addressLine1Permanent').type('40 Ward')
    // cy.get('#postCodePermanent').type('10024')
    // cy.get('#currentAddressSameAsPermanent_false').click()

    // cy.selectOption('#country', 'Bangladesh', 'Bangladesh')
    // cy.selectOption('#state', 'Dhaka', 'Dhaka')
    // cy.selectOption('#district', 'Gazipur', 'Gazipur')
    // cy.selectOption('#addressLine4', 'Kaliganj', 'Kaliganj')
    // cy.selectOption('#addressLine3', 'Bahadursadi', 'Bahadursadi')
    // cy.get('#addressLine2').type('My street')
    // cy.get('#addressLine1').type('40')
    // cy.get('#postCode').type('10024')
    cy.get('#next_section').click()

    //Applicant Details

    cy.selectOption('#iDType', 'Drivers License', 'Drivers License')
    cy.get('#applicantID').type('JS0013011C00001')

    //cy.get('#applicantFirstNames').type('জামাল উদ্দিন খান')
    cy.get('#applicantFamilyName').type('খান')

    // cy.get('#applicantFirstNamesEng').type('Jamal Uddin Khan')
    cy.get('#applicantFamilyNameEng').type('Khan')

    //cy.selectOption('#applicantNationality', 'Bangladesh', 'Bangladesh')
    // cy.get('#applicantBirthDate-dd').type('17')
    // cy.get('#applicantBirthDate-mm').type('10')
    // cy.get('#applicantBirthDate-yyyy').type('1956')

    cy.selectOption(
      '#applicantsRelationToDeceased',
      'Other(Specify)',
      'Other(Specify)'
    )
    cy.get('#applicantOtherRelationship').type('Uncle')
    //cy.get('#applicantPhone').type('01712345678')

    //cy.selectOption('#country', 'Bangladesh', 'Bangladesh')
    cy.selectOption('#state', 'Dhaka', 'Dhaka')
    cy.selectOption('#district', 'Gazipur', 'Gazipur')
    cy.selectOption('#addressLine4', 'Kaliganj', 'Kaliganj')
    cy.selectOption('#addressLine3', 'Bahadursadi', 'Bahadursadi')
    // cy.get('#addressLine2').type('My street')
    // cy.get('#addressLine1').type('48')
    // cy.get('#postCode').type('10024')

    cy.get('#next_section').click()

    //Event

    cy.get('#deathDate-dd').type('03')
    cy.get('#deathDate-mm').type('03')
    cy.get('#deathDate-yyyy').type('2017')
    // cy.selectOption('#manner', 'Homicide', 'Homicide')
    cy.get('#deathPlaceAddress_CURRENT').click()

    cy.get('#next_section').click()
    // Cause of Death
    // cy.get('#causeOfDeathEstablished_true').click()
    // cy.selectOption(
    //   '#methodOfCauseOfDeath',
    //   'Medically Certified Cause of Death',
    //   'Medically Certified Cause of Death'
    // )
    // cy.get('#causeOfDeathCode').type('1009')
    cy.get('#next_section').click()

    //Documents

    //cy.pause()
    cy.get('#next_section').click()
    //Deceased details Next Button
    cy.get('#next_button_deceased').click()
    //Applicant details Next Button
    cy.get('#next_button_informant').click()
    //Event Details Next Button
    cy.get('#next_button_deathEvent').click()

    cy.get('#submit_form').click()
    cy.get('#submit_confirm').click()
    //cy.get('#trackingIdViewer')
  })
})
