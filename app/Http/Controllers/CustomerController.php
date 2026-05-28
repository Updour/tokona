<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Http\Requests\Customers\StoreCustomerRequest;
use App\Http\Requests\Customers\UpdateCustomerRequest;
use App\Services\Customers\CustomerService;

class CustomerController extends Controller
{
    public function __construct(private readonly CustomerService $customerService) {}

    public function index(Request $request)
    {
        return Inertia::render('customers/index', $this->customerService->indexData($request));
    }

    public function store(StoreCustomerRequest $request)
    {
        $this->customerService->create($request->validated());
        return back()->with('success', 'Data Pelanggan berhasil ditambahkan!');
    }

    public function update(UpdateCustomerRequest $request, Customer $customer)
    {
        $this->customerService->update($customer, $request->validated());
        return back()->with('success', 'Data Pelanggan berhasil diperbarui!');
    }

    public function destroy(Customer $customer)
    {
        $this->customerService->delete($customer);
        return back()->with('success', 'Data Pelanggan berhasil dihapus!');
    }

    public function membership(Request $request)
    {
        $data = $this->customerService->getMembershipPageData($request->all());
        return Inertia::render('customers/membership', $data);
    }
}
