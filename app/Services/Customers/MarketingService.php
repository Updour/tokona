<?php

namespace App\Services\Customers;

use App\Models\MarketingCampaign;
use App\Models\Customer;
use Illuminate\Support\Facades\Auth;

class MarketingService
{
    /**
     * Get all campaigns for the index page
     */
    public function getCampaignsData(array $filters): array
    {
        $campaigns = MarketingCampaign::orderBy('created_at', 'desc')
            ->paginate($filters['per_page'] ?? 10)
            ->withQueryString();

        return [
            'campaigns' => $campaigns,
        ];
    }

    /**
     * Store a new campaign
     */
    public function storeCampaign(array $data): MarketingCampaign
    {
        $tenantId = $data['tenant_id'] ?? Auth::user()->tenant_id;
        if (!$tenantId && Auth::user()->isSuperAdmin()) {
            $tenantId = \App\Models\Tenants::first()->id ?? null;
        }
        $data['tenant_id'] = $tenantId;
        $data['created_by'] = Auth::id();
        $data['status'] = 'draft';

        // Calculate total target
        $targetQuery = Customer::where('tenant_id', $tenantId)->whereNotNull('phone')->where('phone', '!=', '');
        
        if ($data['target_audience'] === 'tier_member') {
            $targetQuery->where('tier', 'member');
        } elseif ($data['target_audience'] === 'tier_wholesale') {
            $targetQuery->where('tier', 'wholesale');
        } elseif ($data['target_audience'] === 'points_above_x') {
            $targetQuery->where('points', '>=', $data['min_points']);
        }

        $data['total_target'] = $targetQuery->count();

        return MarketingCampaign::create($data);
    }

    /**
     * Generate dynamic queue list for a campaign
     */
    public function getCampaignQueue(MarketingCampaign $campaign): array
    {
        $targetQuery = Customer::where('tenant_id', $campaign->tenant_id)->whereNotNull('phone')->where('phone', '!=', '');
        
        if ($campaign->target_audience === 'tier_member') {
            $targetQuery->where('tier', 'member');
        } elseif ($campaign->target_audience === 'tier_wholesale') {
            $targetQuery->where('tier', 'wholesale');
        } elseif ($campaign->target_audience === 'points_above_x') {
            $targetQuery->where('points', '>=', $campaign->min_points);
        }

        $customers = $targetQuery->get();
        $queue = [];

        foreach ($customers as $customer) {
            $message = $campaign->message_template;
            $message = str_replace('[NAMA]', $customer->name, $message);
            $message = str_replace('[POIN]', number_format($customer->points, 0, ',', '.'), $message);
            $message = str_replace('[TIER]', strtoupper($customer->tier), $message);

            $queue[] = [
                'customer_id' => $customer->id,
                'name' => $customer->name,
                'phone' => $customer->phone,
                'points' => $customer->points,
                'message' => $message,
                'status' => 'pending'
            ];
        }

        return $queue;
    }

    /**
     * Update campaign status and sent count
     */
    public function updateProgress(MarketingCampaign $campaign, int $sentCount): void
    {
        $campaign->sent_count = $sentCount;
        
        if ($sentCount > 0 && $campaign->status === 'draft') {
            $campaign->status = 'active';
        }
        
        if ($sentCount >= $campaign->total_target && $campaign->total_target > 0) {
            $campaign->status = 'completed';
        }

        $campaign->save();
    }
}
