// script.js
// This script handles interactive elements and real-time data fetching for the Capital Flow Advisory website.

document.addEventListener('DOMContentLoaded', () => {
    // =========================================================================
    // 1. Mobile Navigation Menu Toggle
    // =========================================================================
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    const hamburgerIcon = mobileMenuButton?.querySelector('.hamburger');
    const closeIcon = mobileMenuButton?.querySelector('.close-icon');

    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', () => {
            const isExpanded = mobileMenuButton.getAttribute('aria-expanded') === 'true' || false;
            mobileMenuButton.setAttribute('aria-expanded', !isExpanded);

            if (!isExpanded) {
                mobileMenu.style.display = 'block';
                if (hamburgerIcon) hamburgerIcon.style.display = 'none';
                if (closeIcon) closeIcon.style.display = 'block';
            } else {
                mobileMenu.style.display = 'none';
                if (hamburgerIcon) hamburgerIcon.style.display = 'block';
                if (closeIcon) closeIcon.style.display = 'none';
            }
        });
    }

    // =========================================================================
    // 2. Scroll Reveal for Service Cards
    // =========================================================================
    const serviceCards = document.querySelectorAll('.service-card');

    const revealOnScroll = () => {
        const triggerBottom = window.innerHeight * 0.85;

        serviceCards.forEach(card => {
            const cardTop = card.getBoundingClientRect().top;

            if (cardTop < triggerBottom) {
                card.classList.add('visible');
            }
        });
    };

    window.addEventListener('scroll', revealOnScroll);
    revealOnScroll(); // reveal cards already in view on load

    // =========================================================================
    // 3. Data Rendering Functions (for both mock and real data)
    // =========================================================================

    const renderTopMovers = (moversData) => {
        const gainersTableBody = document.getElementById('gainersTable')?.querySelector('tbody');
        const losersTableBody = document.getElementById('losersTable')?.querySelector('tbody');

        if (!moversData || !Array.isArray(moversData.gainers) || !Array.isArray(moversData.losers)) {
            console.error('renderTopMovers received invalid data:', moversData);
            if (gainersTableBody) gainersTableBody.innerHTML = '<tr><td colspan="3">Data unavailable.</td></tr>';
            if (losersTableBody) losersTableBody.innerHTML = '<tr><td colspan="3">Data unavailable.</td></tr>';
            return;
        }

        const createTableRow = (item, isGainer) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${item.symbol}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">$${item.price}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm ${isGainer ? 'price-up' : 'price-down'}">${item.change}%</td>
            `;
            return tr;
        };

        if (gainersTableBody) gainersTableBody.innerHTML = '';
        if (losersTableBody) losersTableBody.innerHTML = '';

        moversData.gainers.forEach(item => gainersTableBody?.appendChild(createTableRow(item, true)));
        moversData.losers.forEach(item => losersTableBody?.appendChild(createTableRow(item, false)));
    };

    const renderMarketBreadth = (breadthData) => {
        const breadthWidget = document.getElementById('breadthWidget');
        if (!breadthWidget || !breadthData) {
            console.error('renderMarketBreadth received invalid data:', breadthData);
            if (breadthWidget) breadthWidget.innerHTML = '<p class="col-span-3">Data unavailable.</p>';
            return;
        }

        const total = breadthData.advancing + breadthData.declining + breadthData.unchanged;

        breadthWidget.innerHTML = `
            <div class="flex flex-col items-center">
                <p class="text-sm font-medium text-gray-500">Advancing</p>
                <span class="text-lg font-bold indicator-up">${Math.round((breadthData.advancing / total) * 100)}%</span>
            </div>
            <div class="flex flex-col items-center">
                <p class="text-sm font-medium text-gray-500">Declining</p>
                <span class="text-lg font-bold indicator-down">${Math.round((breadthData.declining / total) * 100)}%</span>
            </div>
            <div class="flex flex-col items-center">
                <p class="text-sm font-medium text-gray-500">Unchanged</p>
                <span class="text-lg font-bold text-gray-600">${Math.round((breadthData.unchanged / total) * 100)}%</span>
            </div>
        `;
    };

    const renderMarketChart = (chartData) => {
        const ctx = document.getElementById('marketChart');
        if (ctx) {
            new Chart(ctx, {
                type: 'line',
                data: chartData,
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: { y: { beginAtZero: true } }
                }
            });
        }
    };

    const renderInsights = (newsData, blogsData) => {
        const newsFeedList = document.getElementById('newsFeedList');
        const blogsContainer = document.getElementById('blogsContainer');

        if (!newsFeedList || !blogsContainer || !Array.isArray(newsData) || !Array.isArray(blogsData)) {
            console.error('renderInsights received invalid data.');
            if (newsFeedList) newsFeedList.innerHTML = '<li>Data unavailable.</li>';
            if (blogsContainer) blogsContainer.innerHTML = '<div>Data unavailable.</div>';
            return;
        }

        const createNewsItem = (item) => {
            const li = document.createElement('li');
            li.innerHTML = `<a href="${item.url}" class="hover:text-blue-600">${item.title}</a>`;
            return li;
        };

        const createBlogItem = (item) => {
            const div = document.createElement('div');
            div.className = 'border-b last:border-b-0 pb-2 mb-2';
            div.innerHTML = `
                <h4 class="text-md font-medium text-gray-800"><a href="${item.url}" class="hover:text-blue-600">${item.title}</a></h4>
                <p class="text-sm text-gray-500">${item.author}</p>
            `;
            return div;
        };

        newsFeedList.innerHTML = '';
        blogsContainer.innerHTML = '';

        newsData.forEach(item => newsFeedList.appendChild(createNewsItem(item)));
        blogsData.forEach(item => blogsContainer.appendChild(createBlogItem(item)));
    };

    // =========================================================================
    // 4. API Fetching Logic
    // =========================================================================
    const API_KEY = 'EI339Y34FX1BR93U';

    const fetchMarketData = async () => {
        try {
            if (API_KEY === 'YOUR_ALPHA_VANTAGE_API_KEY') throw new Error('Please provide a valid API key.');

            const moversResponse = await fetch(`https://www.alphavantage.co/query?function=TOP_GAINERS_LOSERS&apikey=${API_KEY}`);
            const moversData = await moversResponse.json();

            if (moversData['Error Message'] || moversData['Note']) {
                throw new Error(moversData['Error Message'] || moversData['Note']);
            }

            if (moversData && Array.isArray(moversData.top_gainers) && Array.isArray(moversData.top_losers)) {
                const gainersData = moversData.top_gainers.map(item => ({
                    symbol: item.ticker,
                    price: parseFloat(item.price).toFixed(2),
                    change: parseFloat(item.change_percentage.replace('%', '')).toFixed(2)
                }));

                const losersData = moversData.top_losers.map(item => ({
                    symbol: item.ticker,
                    price: parseFloat(item.price).toFixed(2),
                    change: parseFloat(item.change_percentage.replace('%', '')).toFixed(2)
                }));

                renderTopMovers({ gainers: gainersData, losers: losersData });
            } else {
                renderTopMovers({ gainers: [], losers: [] });
            }

            const mockBreadthData = { advancing: 2500, declining: 500, unchanged: 100 };
            renderMarketBreadth(mockBreadthData);

        } catch (error) {
            console.error('Failed to fetch market data:', error);
            const gainersBody = document.getElementById('gainersTable')?.querySelector('tbody');
            const losersBody = document.getElementById('losersTable')?.querySelector('tbody');
            const breadthWidget = document.getElementById('breadthWidget');

            if (gainersBody) gainersBody.innerHTML = `<tr><td colspan="3">${error.message}</td></tr>`;
            if (losersBody) losersBody.innerHTML = `<tr><td colspan="3">${error.message}</td></tr>`;
            if (breadthWidget) breadthWidget.innerHTML = `<p>${error.message}</p>`;
        }
    };

    const renderMockChartData = () => {
        const mockChartData = {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
            datasets: [{
                label: 'Market Performance (%)',
                data: [0, 2.5, 1.8, 5.2, 4.1, 7.5, 6.9],
                backgroundColor: 'rgba(59, 130, 246, 0.2)',
                borderColor: '#3b82f6',
                borderWidth: 2,
                tension: 0.4,
                fill: true
            }]
        };
        renderMarketChart(mockChartData);
    };

    const renderMockInsights = () => {
        const mockNewsData = [
            { title: 'Global Markets Rebound as Inflation Fears Ease', url: '#' },
            { title: 'Tech Giants Announce Record-Breaking Q2 Earnings', url: '#' },
            { title: 'Central Bank Holds Rates Amidst Economic Uncertainty', url: '#' },
            { title: 'Supply Chain Disruptions Continue to Impact Manufacturing', url: '#' },
            { title: 'New Regulations Spark Debate in the Financial Sector', url: '#' }
        ];

        const mockBlogsData = [
            { title: 'The Future of Fintech: A Comprehensive Analysis', author: 'By Jane Doe', url: '#' },
            { title: 'Navigating Volatility: A Guide for Long-Term Investors', author: 'By John Smith', url: '#' },
            { title: 'Decoding Economic Indicators: What You Need to Know', author: 'By The CapitalFlow Team', url: '#' }
        ];

        renderInsights(mockNewsData, mockBlogsData);
    };

    // =========================================================================
    // 5. Initial Load
    // =========================================================================
    fetchMarketData();
    renderMockChartData();
    renderMockInsights();
});
