import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { PasswordService } from './password.service';
import { Validators } from '@angular/forms';

describe('PasswordService', () => {
	let service: PasswordService;
	let httpMock: HttpTestingController;

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [HttpClientTestingModule],
			providers: [PasswordService]
		});
		service = TestBed.inject(PasswordService);
		httpMock = TestBed.inject(HttpTestingController);
	});

	afterEach(() => {
		httpMock.verify();
	});

	it('should set password', async () => {
		jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000; // Increase timeout interval

		const setPassword = {
			password: {
				Validators: [Validators.required],
				ErrorMessages: { required: 'Current password is required' },
				value: 'newPassword'
			},
			confirmPassword: {
				Validators: [Validators.required],
				ErrorMessages: { required: 'Current password is required' },
				value: 'newPassword'
			}
		};
		const expectedResponse = {
			password: {
				Validators: [Validators.required],
				ErrorMessages: { required: 'Current password is required' },
				value: 'newPassword'
			},
			confirmPassword: {
				Validators: [Validators.required],
				ErrorMessages: { required: 'Current password is required' },
				value: 'newPassword'
			}
		};

		// Mock the HTTP request
		service.setPassword(setPassword).then(response => {
			expect(response).toEqual(expectedResponse);
		});

		const req = httpMock.expectOne('https://portal2.chambers-owen.com:4438/service//chngpwd');
		expect(req.request.method).toBe('POST');
		req.flush(expectedResponse); // Respond with the expected response
	});
});