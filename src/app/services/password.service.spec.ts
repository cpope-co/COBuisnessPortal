import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { PasswordService } from './password.service';
import { SetPassword } from '../models/password.model';
import { environment } from '../../environments/environment';
import { Validators } from '@angular/forms';

describe('PasswordService', () => {
    let service: PasswordService;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [PasswordService],
        });
        service = TestBed.inject(PasswordService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should set password', async () => {
        const setPassword: SetPassword = {
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
        const expectedResponse: SetPassword = {
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
        const promise = service.setPassword(setPassword);

        const req = httpMock.expectOne(`${environment.apiBaseUrl}/chngpwd`);
        expect(req.request.method).toBe('POST');
        expect(req.request.body).toEqual(setPassword);

        req.flush(expectedResponse);

        const response = await promise;
        expect(response).toEqual(expectedResponse);
    });
});