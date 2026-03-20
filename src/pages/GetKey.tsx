import { motion } from 'motion/react';
import { Key, ExternalLink, ShoppingCart, CreditCard, Gift, Clock, Zap, Star, Shield } from 'lucide-react';
import { useState } from 'react';

export default function GetKey() {
  const [activePage, setActivePage] = useState<'main' | 'buy'>('main');

  if (activePage === 'buy') {
    return <BuyKeyPage onBack={() => setActivePage('main')} />;
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-10 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-red-600/10 border border-red-900/30 mb-4 shadow-[0_0_30px_rgba(220,38,38,0.2)]">
          <Key className="w-8 h-8 text-red-500" />
        </div>
        <h1 className="text-4xl font-black tracking-tighter mb-3 text-white">
          GET <span className="text-red-600">KEY</span>
        </h1>
        <p className="text-zinc-400 text-lg">Choose how you want to access ZXCHUB premium features</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Free Key */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative bg-[#0a0a0a] border border-zinc-800/80 rounded-2xl p-8 flex flex-col gap-6 hover:border-zinc-700 transition-all shadow-xl"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-green-500/10 border border-green-500/20">
              <Gift className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Free Key</h2>
              <p className="text-zinc-500 text-sm">No payment required</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-3 p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/50">
              <Zap className="w-5 h-5 text-yellow-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-white font-semibold text-sm">Get Free Key</p>
                <p className="text-zinc-400 text-xs mt-1">Join our Discord server and get your free key instantly from our bot or staff.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/50">
              <Clock className="w-5 h-5 text-blue-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-white font-semibold text-sm">Watch Ads — Free Key for 12 Hours</p>
                <p className="text-zinc-400 text-xs mt-1">Watch a short ad to receive a temporary key valid for 12 hours at no cost.</p>
              </div>
            </div>
          </div>

          <a
            href="https://discord.gg/rnJC4yYfsU"
            target="_blank"
            rel="noreferrer"
            className="mt-auto flex items-center justify-center gap-2 px-6 py-3.5 bg-green-600 hover:bg-green-500 text-white rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(34,197,94,0.25)] hover:shadow-[0_0_30px_rgba(34,197,94,0.4)] text-sm"
          >
            <ExternalLink className="w-4 h-4" />
            Get Free Key via Discord
          </a>
        </motion.div>

        {/* Buy Key */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative bg-[#0a0a0a] border border-red-900/40 rounded-2xl p-8 flex flex-col gap-6 hover:border-red-800/60 transition-all shadow-xl shadow-red-950/20"
        >
          <div className="absolute top-4 right-4">
            <span className="px-2.5 py-1 rounded-md bg-red-600/20 text-red-400 text-xs font-bold border border-red-600/30">
              PREMIUM
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20">
              <ShoppingCart className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Buy Key</h2>
              <p className="text-zinc-500 text-sm">Robux · PayPal · Card · Crypto</p>
            </div>
          </div>

          <div className="space-y-2">
            {[
              { price: 'From 25 Robux', desc: '1 Day Access', icon: '🎮' },
              { price: 'From $1.80', desc: '1 Week Access', icon: '💳' },
              { price: 'From $5.99', desc: '1 Month Access', icon: '🌟' },
              { price: 'From $14.99', desc: 'Lifetime Access', icon: '♾️' },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between px-4 py-2.5 rounded-lg bg-zinc-900/50 border border-zinc-800/50">
                <span className="text-zinc-300 text-sm">{item.icon} {item.desc}</span>
                <span className="text-red-400 font-bold text-sm">{item.price}</span>
              </div>
            ))}
          </div>

          <p className="text-xs text-zinc-500">
            Grants access to premium scripts + keyless access to all free scripts.
          </p>

          <button
            onClick={() => setActivePage('buy')}
            className="mt-auto flex items-center justify-center gap-2 px-6 py-3.5 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(220,38,38,0.3)] hover:shadow-[0_0_30px_rgba(220,38,38,0.5)] text-sm"
          >
            <ShoppingCart className="w-4 h-4" />
            Buy Key — View Options
          </button>
        </motion.div>
      </div>

      {/* Features */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-8 bg-[#0a0a0a] border border-zinc-800/80 rounded-2xl p-6"
      >
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Star className="w-5 h-5 text-yellow-400" /> What You Get With a Key
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: Shield, title: 'Premium Scripts', desc: 'Access to all exclusive premium scripts' },
            { icon: Zap, title: 'Keyless Access', desc: 'Skip key system on all free scripts' },
            { icon: Star, title: 'Priority Support', desc: 'Faster support response in Discord' },
          ].map((f, i) => (
            <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-zinc-900/40 border border-zinc-800/40">
              <f.icon className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-white font-semibold text-sm">{f.title}</p>
                <p className="text-zinc-500 text-xs mt-1">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

function BuyKeyPage({ onBack }: { onBack: () => void }) {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8 flex items-center gap-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-lg transition-colors border border-zinc-800 text-sm"
        >
          ← Back
        </button>
        <div>
          <h1 className="text-3xl font-black tracking-tighter text-white">
            BUY <span className="text-red-600">KEY</span>
          </h1>
          <p className="text-zinc-400 text-sm">Choose your preferred payment method</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Robux */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[#0a0a0a] border border-zinc-800/80 rounded-2xl p-6 flex flex-col gap-5 hover:border-zinc-700 transition-all"
        >
          <div className="flex items-center gap-3">
            <span className="text-3xl">🎮</span>
            <div>
              <h2 className="text-lg font-bold text-white">Buy With Robux</h2>
              <p className="text-zinc-500 text-xs">In-game purchase on Roblox</p>
            </div>
          </div>

          <div className="space-y-2">
            {[
              { price: '25 Robux', period: '1 Day Access' },
              { price: '150 Robux', period: '1 Week Access' },
              { price: '500 Robux', period: '1 Month Access' },
            ].map((item, i) => (
              <div key={i} className="flex justify-between items-center px-3 py-2 rounded-lg bg-zinc-900/60 border border-zinc-800/50 text-sm">
                <span className="text-zinc-300">{item.period}</span>
                <span className="text-yellow-400 font-bold">{item.price}</span>
              </div>
            ))}
          </div>

          <div className="text-xs text-zinc-500 leading-relaxed bg-zinc-900/40 rounded-lg p-3 border border-zinc-800/40">
            <p className="font-semibold text-zinc-400 mb-2">How it works:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Click <strong className="text-white">BUY NOW</strong> below</li>
              <li>Enter the game and select your plan</li>
              <li>Complete the Robux payment</li>
              <li>Open a ticket in Discord with your Roblox username</li>
              <li>Staff will activate your key shortly</li>
            </ol>
            <p className="mt-2 text-zinc-600">Grants: premium + keyless access to free scripts</p>
          </div>

          <a
            href="https://www.roblox.com/games/107479861631807/ZXCHUB-KEY"
            target="_blank"
            rel="noreferrer"
            className="mt-auto flex items-center justify-center gap-2 px-6 py-3.5 bg-yellow-500 hover:bg-yellow-400 text-black rounded-xl font-black transition-all shadow-[0_0_20px_rgba(234,179,8,0.25)] hover:shadow-[0_0_30px_rgba(234,179,8,0.4)] text-sm"
          >
            <ExternalLink className="w-4 h-4" />
            BUY NOW
          </a>
        </motion.div>

        {/* Card / Cash / Crypto */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative bg-[#0a0a0a] border border-red-900/40 rounded-2xl p-6 flex flex-col gap-5 hover:border-red-800/60 transition-all shadow-[0_0_30px_rgba(220,38,38,0.08)]"
        >
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <span className="px-3 py-1 rounded-full bg-red-600 text-white text-xs font-bold shadow-[0_0_15px_rgba(220,38,38,0.5)]">
              MOST POPULAR
            </span>
          </div>

          <div className="flex items-center gap-3 mt-2">
            <span className="text-3xl">💳</span>
            <div>
              <h2 className="text-lg font-bold text-white">Buy Via Card / Cash App / Crypto</h2>
              <p className="text-zinc-500 text-xs">Instant key delivery</p>
            </div>
          </div>

          <div className="space-y-2">
            {[
              { price: '$1.80', period: '1 Week Access' },
              { price: '$5.99', period: '1 Month Access' },
              { price: '$14.99', period: 'Lifetime Access' },
            ].map((item, i) => (
              <div key={i} className="flex justify-between items-center px-3 py-2 rounded-lg bg-zinc-900/60 border border-zinc-800/50 text-sm">
                <span className="text-zinc-300">{item.period}</span>
                <span className="text-red-400 font-bold">{item.price}</span>
              </div>
            ))}
          </div>

          <div className="text-xs text-zinc-500 leading-relaxed bg-zinc-900/40 rounded-lg p-3 border border-zinc-800/40">
            <p className="font-semibold text-zinc-400 mb-2">How it works:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Click <strong className="text-white">BUY NOW</strong> below</li>
              <li>Select your preferred payment method</li>
              <li>Complete the payment</li>
              <li>Your key will be delivered <strong className="text-white">instantly</strong> after purchase</li>
            </ol>
            <p className="mt-2 text-zinc-600">Grants: premium + keyless access to free scripts</p>
          </div>

          <a
            href="https://rumblehub.store/product/zxchub"
            target="_blank"
            rel="noreferrer"
            className="mt-auto flex items-center justify-center gap-2 px-6 py-3.5 bg-red-600 hover:bg-red-500 text-white rounded-xl font-black transition-all shadow-[0_0_20px_rgba(220,38,38,0.3)] hover:shadow-[0_0_30px_rgba(220,38,38,0.5)] text-sm"
          >
            <ExternalLink className="w-4 h-4" />
            BUY NOW
          </a>
        </motion.div>

        {/* PayPal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-[#0a0a0a] border border-zinc-800/80 rounded-2xl p-6 flex flex-col gap-5 hover:border-zinc-700 transition-all"
        >
          <div className="flex items-center gap-3">
            <span className="text-3xl">🅿️</span>
            <div>
              <h2 className="text-lg font-bold text-white">Buy Via PayPal</h2>
              <p className="text-zinc-500 text-xs">Secure PayPal payment</p>
            </div>
          </div>

          <div className="space-y-2">
            {[
              { price: '$1.80', period: '1 Week Access' },
              { price: '$5.99', period: '1 Month Access' },
              { price: '$14.99', period: 'Lifetime Access' },
            ].map((item, i) => (
              <div key={i} className="flex justify-between items-center px-3 py-2 rounded-lg bg-zinc-900/60 border border-zinc-800/50 text-sm">
                <span className="text-zinc-300">{item.period}</span>
                <span className="text-blue-400 font-bold">{item.price}</span>
              </div>
            ))}
          </div>

          <div className="text-xs text-zinc-500 leading-relaxed bg-zinc-900/40 rounded-lg p-3 border border-zinc-800/40">
            <p className="font-semibold text-zinc-400 mb-2">How it works:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Click <strong className="text-white">BUY NOW</strong> below</li>
              <li>Send the payment for your chosen plan</li>
              <li>After payment, open a ticket in Discord</li>
              <li>Staff will activate your key shortly</li>
            </ol>
            <p className="mt-2 font-semibold text-zinc-400">Pricing:</p>
            <ul className="mt-1 space-y-0.5">
              <li>$1.80 — 1 Week Access</li>
              <li>$5.99 — 1 Month Access</li>
              <li>$14.99 — Lifetime Access</li>
            </ul>
            <p className="mt-2 text-zinc-600">Grants: premium + keyless access to free scripts</p>
          </div>

          <a
            href="https://paypal.me/MarinZXC"
            target="_blank"
            rel="noreferrer"
            className="mt-auto flex items-center justify-center gap-2 px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-black transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] text-sm"
          >
            <ExternalLink className="w-4 h-4" />
            BUY NOW
          </a>
        </motion.div>
      </div>

      {/* Discord note */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-6 p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/50 flex items-center gap-3 text-sm text-zinc-400"
      >
        <span className="text-xl">💬</span>
        <span>After purchase, join our <a href="https://discord.gg/rnJC4yYfsU" target="_blank" rel="noreferrer" className="text-red-400 hover:text-red-300 font-medium">Discord server</a> and open a ticket if you need help activating your key.</span>
      </motion.div>
    </div>
  );
}
