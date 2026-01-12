import { faker } from '@faker-js/faker';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface SampleData {
  CustNumber: number;
  CustName: string;
  CustAddress: string;
  CustTypeCode: string;
  CustTypeDesc: string;
  CandyLiker: boolean;
}

const TYPE_CODES = [
  { code: 'A', desc: 'Premium Customer' },
  { code: 'B', desc: 'Standard Customer' },
  { code: 'C', desc: 'Budget Customer' },
  { code: 'D', desc: 'Wholesale Customer' }
];

function generateCustomer(custNumber: number, typeIndex: number, candyLiker: boolean): SampleData {
  const typeInfo = TYPE_CODES[typeIndex % TYPE_CODES.length];
  
  return {
    CustNumber: custNumber,
    CustName: faker.company.name(),
    CustAddress: `${faker.location.streetAddress()}, ${faker.location.city()}, ${faker.location.state({ abbreviated: true })} ${faker.location.zipCode()}`,
    CustTypeCode: typeInfo.code,
    CustTypeDesc: typeInfo.desc,
    CandyLiker: candyLiker
  };
}

function generateDefaultCustomers(): SampleData[] {
  // Use a seed for reproducible data
  faker.seed(12345);
  
  const customers: SampleData[] = [];
  
  // Generate 8 customers with varied types and candy preferences
  for (let i = 0; i < 8; i++) {
    customers.push(generateCustomer(
      1001 + i,
      i % 4, // Cycle through types A, B, C, D
      i % 2 === 0 // Alternate candy preference
    ));
  }
  
  return customers;
}

function generateLargeCustomerList(): SampleData[] {
  // Use a seed for reproducible data
  faker.seed(54321);
  
  const customers: SampleData[] = [];
  
  // Generate 75 customers for pagination testing
  for (let i = 0; i < 75; i++) {
    customers.push(generateCustomer(
      1001 + i,
      Math.floor(Math.random() * 4), // Random type
      Math.random() > 0.5 // Random candy preference
    ));
  }
  
  return customers;
}

function generateSingleCustomer(): SampleData[] {
  faker.seed(99999);
  
  return [generateCustomer(1001, 0, true)];
}

function saveFixture(filename: string, data: any): void {
  const fixturesDir = path.join(__dirname);
  const filePath = path.join(fixturesDir, filename);
  
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  console.log(`✓ Generated ${filename}`);
}

// Generate all fixtures
console.log('Generating customer fixtures...');

saveFixture('default-customers.json', generateDefaultCustomers());
saveFixture('empty-customers.json', []);
saveFixture('single-customer.json', generateSingleCustomer());
saveFixture('large-customer-list.json', generateLargeCustomerList());

console.log('✓ All customer fixtures generated successfully!');
