import { buildFHIRBundle } from 'src/features/registration/fhir-builders'

test('should build a minimal FHIR registration document without error', async () => {
  const fhir = await buildFHIRBundle({
    mother: {
      identifier: [{ id: '123456', type: 'PASSPORT' }],
      gender: 'female',
      name: [{ firstNames: 'Jane', familyName: 'Doe', use: 'english' }]
    },
    father: { gender: 'male', name: [] },
    child: { gender: 'male', name: [] },
    createdAt: new Date()
  })
  expect(fhir).toBeDefined()
  expect(fhir.entry[0].resource.section.length).toBe(3)
  expect(fhir.entry[0].resource.date).toBeDefined()
  expect(fhir.entry[1].resource.gender).toBe('female')
  expect(fhir.entry[2].resource.gender).toBe('male')
  expect(fhir.entry[3].resource.gender).toBe('male')
  expect(fhir.entry[1].resource.name[0].given[0]).toBe('Jane')
  expect(fhir.entry[1].resource.name[0].family[0]).toBe('Doe')
  expect(fhir.entry[1].resource.name[0].use).toBe('english')
  expect(fhir.entry[1].resource.identifier[0].id).toBe('123456')
  expect(fhir.entry[1].resource.identifier[0].type).toBe('PASSPORT')
})
