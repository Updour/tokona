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
        $customerClone = clone $customer;
        $this->customerService->delete($customer);

        \App\Services\ActivityLogger::log('Hapus Data Penting', "Menghapus pelanggan: {$customerClone->name}", $customerClone, ['customer_name' => $customerClone->name]);

        return back()->with('success', 'Data Pelanggan berhasil dinonaktifkan!');
    }

    public function restore(string $id)
    {
        $customer = $this->customerService->restore($id);

        \App\Services\ActivityLogger::log('Restore Data', "Memulihkan pelanggan: {$customer->name}", $customer, ['customer_name' => $customer->name]);

        return back()->with('success', 'Data Pelanggan berhasil dipulihkan!');
    }

    public function membership(Request $request)
    {
        $data = $this->customerService->getMembershipPageData($request->all());
        return Inertia::render('customers/membership', $data);
    }
}
