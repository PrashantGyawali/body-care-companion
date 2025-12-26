import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

const tiers = [
  {
    name: 'Free',
    price: '$0',
    description: 'Essential features for personal use',
    features: ['Access to basic exercises', 'Personal progress tracking', 'Community support', 'Basic analytics'],
    buttonText: 'Get Started',
    href: '/register',
    popular: false,
  },
  {
    name: 'Pro',
    price: '$9.99',
    period: '/month',
    description: 'Advanced features for serious athletes',
    features: [
      'All basic exercises',
      'Advanced AI form correction',
      'Detailed performance analytics',
      'Priority support',
      'Custom workout plans',
    ],
    buttonText: 'Start Free Trial',
    href: '/register',
    popular: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    description: 'Scalable solutions for gyms and teams',
    features: [
      'Everything in Pro',
      'Team management',
      'API access',
      'Dedicated account manager',
      'Custom branding',
    ],
    buttonText: 'Contact Sales',
    href: '/contact',
    popular: false,
  },
];

const Pricing = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-24">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="text-center space-y-4 mb-16">
          <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl text-gray-900 dark:text-gray-100">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-500 dark:text-gray-400 max-w-[700px] mx-auto">
            Choose the perfect plan for your fitness journey. No hidden fees.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {tiers.map((tier) => (
            <Card
              key={tier.name}
              className={`flex flex-col relative ${tier.popular
                  ? 'border-primary shadow-lg scale-105 z-10'
                  : 'border-border shadow-sm hover:shadow-md transition-shadow'
                }`}
            >
              {tier.popular && (
                <div className="absolute top-0 right-0 -mt-3 -mr-3 px-3 py-1 bg-primary text-primary-foreground text-xs font-bold rounded-full uppercase tracking-wide">
                  Most Popular
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-2xl font-bold">{tier.name}</CardTitle>
                <CardDescription>{tier.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="flex items-baseline mb-6">
                  <span className="text-4xl font-bold tracking-tight">{tier.price}</span>
                  {tier.period && (
                    <span className="ml-1 text-gray-500 dark:text-gray-400 font-medium">{tier.period}</span>
                  )}
                </div>
                <ul className="space-y-3">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                      <span className="text-gray-600 dark:text-gray-300 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  asChild
                  className={`w-full ${tier.popular ? 'bg-primary hover:bg-primary/90' : ''}`}
                  variant={tier.popular ? 'default' : 'outline'}
                >
                  <Link to={tier.href}>{tier.buttonText}</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
        <div className="mt-12 text-center">
          <Link to="/" className="text-sm text-gray-500 hover:underline">Back to Home</Link>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
