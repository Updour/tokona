<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use App\Models\MarketingCampaign;
use App\Services\Customers\MarketingService;
use Illuminate\Http\RedirectResponse;

class MarketingController extends Controller
{
    public function __construct(private readonly MarketingService $marketingService) {}

    public function index(Request $request): Response
    {
        $data = $this->marketingService->getCampaignsData($request->all());
        return Inertia::render('customers/marketing/Index', $data);
    }

    public function create(): Response
    {
        return Inertia::render('customers/marketing/Create');
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'target_audience' => 'required|in:all,tier_member,tier_wholesale,points_above_x',
            'min_points' => 'required_if:target_audience,points_above_x|integer|min:0',
            'message_template' => 'required|string|min:10',
        ]);

        $this->marketingService->storeCampaign($validated);

        return redirect()->route('marketing.index')->with('success', 'Kampanye Broadcast berhasil dibuat!');
    }

    public function show(MarketingCampaign $campaign): Response
    {
        $queue = $this->marketingService->getCampaignQueue($campaign);

        return Inertia::render('customers/marketing/Show', [
            'campaign' => $campaign,
            'queue' => $queue
        ]);
    }

    public function updateProgress(Request $request, MarketingCampaign $campaign): \Illuminate\Http\RedirectResponse
    {
        $validated = $request->validate([
            'sent_count' => 'required|integer|min:0'
        ]);

        $this->marketingService->updateProgress($campaign, $validated['sent_count']);

        return back();
    }
}
